"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface ApiIpLocation {
  id: number;
  latitude: number;
  longitude: number;
  rawData: {
    FromName?: string;
    From?: string;
    Subject?: string;
  };
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
    setMapboxTokenError(null); // Clear any previous error

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
        fetchedIpLocations.forEach((location) => {
          if (
            typeof location.longitude !== "number" ||
            typeof location.latitude !== "number"
          ) {
            console.warn(
              "Skipping location with invalid coordinates:",
              location
            );
            return;
          }

          const el = document.createElement("div");

          el.className = "marker";
          el.style.backgroundImage = `url(/email.svg)`;
          el.style.width = `35px`;
          el.style.height = `45px`;
          el.style.backgroundSize = "100%";
          el.style.display = "block";
          el.style.border = "none";
          el.style.borderRadius = "50%";
          el.style.cursor = "pointer";
          el.style.padding = "0";

          const fromName = location.rawData?.FromName || "Unknown Sender";
          const fromEmail = location.rawData?.From || "N/A";
          const subject = location.rawData?.Subject || "No Subject";
          const country = location.country || "N/A";
          const emailCount =
            location.emailCount !== undefined ? location.emailCount : "N/A";
          const countryFlag = location.countryFlag;

          const popupContent = `
            <div style="color: black; font-family: sans-serif; padding: 8px; font-size: 14px;">
              <h3 style="margin: 0 0 8px 0; font-size: 1.1em;">Email Details</h3>
              <p style="margin: 4px 0;"><strong>From:</strong> ${fromName} (${fromEmail})</p>
              <p style="margin: 4px 0;"><strong>Subject:</strong> ${subject}</p>
              <hr style="margin: 8px 0;">
              <span style="margin: 4px 0; display: flex; gap: 5px;"><strong>Location:</strong><img src="${countryFlag}" alt="${country}_flag_image" width="30" height="10"> ${country}</span>
              <p s></p>
              <p style="margin: 4px 0;"><strong>Email Count:</strong> ${emailCount}</p>
            </div>`;
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            popupContent
          );

          const newMarker = new mapboxgl.Marker(el)
            .setLngLat([location.longitude, location.latitude])
            .setPopup(popup)
            .addTo(map);
          markersRef.current.push(newMarker);
        });

        if (!initialFlyToDoneRef.current) {
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
