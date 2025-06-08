"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface ApiIpLocation {
  ipAddress: string;
  latitude: number | null;
  longitude: number | null;
  rawData:
    | {
        FromName?: string;
        From?: string;
        Subject?: string;
      }
    | any;
  country?: string | null;
  emailCount?: number;
  countryFlag?: string | null;
}

const Planet = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [fetchedIpLocations, setFetchedIpLocations] = useState<ApiIpLocation[]>(
    []
  );
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const initialFlyToDoneRef = useRef(false);
  const [mapboxTokenError, setMapboxTokenError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIpLocations = async () => {
      try {
        const response = await fetch("/api/iplocations");
        if (!response.ok) {
          throw new Error(`Failed to fetch IP locations: ${response.status}`);
        }
        const data: ApiIpLocation[] = await response.json();
        setFetchedIpLocations(data);
      } catch (error) {
        console.error("Error fetching IP locations:", error);
      }
    };
    fetchIpLocations();
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!mapboxAccessToken) {
      console.error(
        "Mapbox access token is not set. Please set NEXT_PUBLIC_MAPBOX_TOKEN."
      );
      setMapboxTokenError(
        "Mapbox access token is missing. Map cannot be loaded."
      );
      return;
    }
    setMapboxTokenError(null);

    if (!mapRef.current) {
      mapboxgl.accessToken = mapboxAccessToken;

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-65.017, -16.457],
        zoom: 2,
      });
    }

    const map = mapRef.current;
    if (!map) return;

    const updateMarkersAndSetInitialView = () => {
      if (!map.isStyleLoaded()) {
        map.once("styledata", updateMarkersAndSetInitialView);
        return;
      }

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      if (fetchedIpLocations.length > 0) {
        const locationsByCoord: Record<string, ApiIpLocation[]> = {};
        fetchedIpLocations.forEach((location) => {
          if (
            typeof location.longitude === "number" &&
            typeof location.latitude === "number"
          ) {
            const key = `${location.latitude.toFixed(
              5
            )}_${location.longitude.toFixed(5)}`;
            if (!locationsByCoord[key]) {
              locationsByCoord[key] = [];
            }
            locationsByCoord[key].push(location);
          }
        });

        Object.values(locationsByCoord).forEach((group) => {
          if (group.length === 0) return;

          const representativeLocation = group[0];
          const { longitude, latitude } = representativeLocation;

          if (typeof longitude !== "number" || typeof latitude !== "number")
            return;

          const el = document.createElement("div");
          el.className = "marker";
          el.style.width = `45px`;
          el.style.height = `35px`;
          el.style.backgroundSize = "contain";
          el.style.display = "block";
          el.style.border = "none";
          el.style.cursor = "pointer";
          el.style.padding = "0";
          el.style.backgroundRepeat = "no-repeat";

          let popupContentHtml = "";
          let markerIconUrl = "/email.png";

          if (group.length === 1) {
            const location = group[0];
            const fromName = location.rawData?.FromName || "Unknown Sender";
            const fromEmail = location.rawData?.From || "N/A";
            const subject = location.rawData?.Subject || "No Subject";
            const country = location.country || "N/A";
            const emailCount = location.emailCount ?? "N/A";
            const countryFlag = location.countryFlag;

            popupContentHtml = `
              <div style="color: black; font-family: sans-serif; padding: 8px; font-size: 14px; max-height: 300px; overflow-y: auto;">
                <h3 style="margin: 0 0 8px 0; font-size: 1.1em;">Email Details</h3>
                <p style="margin: 4px 0;"><strong>From:</strong> ${fromName} (${fromEmail})</p>
                <p style="margin: 4px 0;"><strong>Subject:</strong> ${subject}</p>
                <hr style="margin: 8px 0;">
                <span style="margin: 4px 0; display: flex; align-items: center; gap: 5px;"><strong>Location:</strong>${
                  countryFlag
                    ? `<img src="${countryFlag}" alt="${country}_flag_image" width="20" height="15" style="display: inline-block; vertical-align: middle;">`
                    : ""
                } ${country}</span>
                <p style="margin: 4px 0;"><strong>Emails from this IP:</strong> ${emailCount}</p>
              </div>`;
          } else {
            markerIconUrl = "/email-group.png";
            const totalEmailsFromAllSourcesInGroup = group.reduce(
              (sum, loc) => sum + (loc.emailCount || 0),
              0
            );
            const country = representativeLocation.country || "N/A";
            const countryFlag = representativeLocation.countryFlag;

            let sourcesHtml =
              '<ul style="list-style: none; padding-left: 0; margin-top: 5px;">';
            group.forEach((loc, index) => {
              const fromName = loc.rawData?.FromName || "Unknown Sender";
              const fromEmail = loc.rawData?.From || "N/A";
              const subject = loc.rawData?.Subject || "No Subject";
              const individualIpEmailCount = loc.emailCount || 0;
              sourcesHtml += `
                <li style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #eee;">
                  <p style="margin: 2px 0; font-size: 0.9em;"><strong>Src ${
                    index + 1
                  } From:</strong> ${fromName} (${fromEmail})</p>
                  <p style="margin: 2px 0; font-size: 0.9em;"><strong>Subject:</strong> ${subject}</p>
                  <p style="margin: 2px 0; font-size: 0.9em;"><strong>Emails from this IP:</strong> ${individualIpEmailCount}</p>
                </li>`;
            });
            sourcesHtml += "</ul>";
            if (group.length === 0)
              sourcesHtml = "<p>No source details available.</p>";

            popupContentHtml = `
              <div style="color: black; font-family: sans-serif; padding: 8px; font-size: 14px; max-height: 300px; overflow-y: auto;">
                <h3 style="margin: 0 0 8px 0; font-size: 1.1em;">Multiple Email Sources (${
                  group.length
                })</h3>
                <p style="margin: 4px 0;"><strong>Total emails from these sources:</strong> ${totalEmailsFromAllSourcesInGroup}</p>
                <span style="margin: 4px 0; display: flex; align-items: center; gap: 5px;"><strong>Location:</strong>${
                  countryFlag
                    ? `<img src="${countryFlag}" alt="${country}_flag_image" width="20" height="15" style="display: inline-block; vertical-align: middle;">`
                    : ""
                } ${country}</span>
                <hr style="margin: 8px 0;">
                <h4 style="margin: 10px 0 5px 0; font-size: 1em;">Individual Sources:</h4>
                ${sourcesHtml}
              </div>`;
          }

          el.style.backgroundImage = `url(${markerIconUrl})`;
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            popupContentHtml
          );

          const newMarker = new mapboxgl.Marker(el)
            .setLngLat([longitude, latitude])
            .setPopup(popup)
            .addTo(map);
          markersRef.current.push(newMarker);
        });

        if (!initialFlyToDoneRef.current && fetchedIpLocations.length > 0) {
          const lastLocation =
            fetchedIpLocations[fetchedIpLocations.length - 1];
          if (
            lastLocation &&
            typeof lastLocation.latitude === "number" &&
            typeof lastLocation.longitude === "number"
          ) {
            map.flyTo({
              center: [lastLocation.longitude, lastLocation.latitude],
              zoom: 2,
              essential: true,
            });
            initialFlyToDoneRef.current = true;
          }
        }
      }
    };

    if (map.isStyleLoaded()) {
      updateMarkersAndSetInitialView();
    } else {
      map.once("load", updateMarkersAndSetInitialView);
    }
  }, [fetchedIpLocations]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (mapboxTokenError) {
    return (
      <div style={{ padding: "20px", color: "red", textAlign: "center" }}>
        {mapboxTokenError}
      </div>
    );
  }

  return (
    <div
      style={{ height: "100%" }}
      ref={mapContainerRef}
      className="map-container"
    />
  );
};

export default Planet;
