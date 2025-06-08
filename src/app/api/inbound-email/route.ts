import { NextRequest, NextResponse } from "next/server";

import {
  getIpLocationByIp,
  createIpLocation,
  incrementEmailCount,
} from "@/db/queries";

export async function POST(req: NextRequest) {
  try {
    const emailData = await req.json();
    console.log("Received webhook data:", JSON.stringify(emailData, null, 2));

    const extractClientIp = (headerValue: string): string | null => {
      if (!headerValue) return null;
      const match = headerValue.match(
        /client-ip=([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/
      );
      return match && match[1] ? match[1] : null;
    };

    let ipAddress: string | null = null;

    if (emailData.Headers && Array.isArray(emailData.Headers)) {
      const receivedSpfHeader = emailData.Headers.find(
        (h: { Name?: string; Value?: string }) => h.Name === "Received-SPF"
      );
      if (receivedSpfHeader && receivedSpfHeader.Value) {
        ipAddress = extractClientIp(receivedSpfHeader.Value);
      }
    }

    if (!ipAddress) {
      ipAddress = emailData.SourceIp || emailData.Client?.IP || null;
    }

    if (!ipAddress) {
      console.log("IP address could not be extracted from webhook data.");
      return NextResponse.json(
        { success: false, error: "IP address not found in webhook data" },
        { status: 400 }
      );
    }

    let finalGeolocationData: any;
    let source = "api";
    let currentEmailCount = 1;

    const existingLocation = await getIpLocationByIp(ipAddress);

    if (existingLocation) {
      console.log("Found IP in DB:", ipAddress);
      source = "database";

      const updatedLocationData = await incrementEmailCount(ipAddress);

      if (updatedLocationData) {
        finalGeolocationData = {
          latitude: updatedLocationData.latitude,
          longitude: updatedLocationData.longitude,
          country: updatedLocationData.country,
          countryFlag: updatedLocationData.countryFlag,
        };
        currentEmailCount = updatedLocationData.emailCount;
      } else {
        console.warn(
          `Failed to increment email count for IP: ${ipAddress}, using stale data from initial fetch.`
        );

        finalGeolocationData = {
          latitude: existingLocation.latitude,
          longitude: existingLocation.longitude,
          country: existingLocation.country,
          countryFlag: existingLocation.countryFlag,
        };
        currentEmailCount = existingLocation.emailCount;
      }
    } else {
      console.log("IP not found in DB, fetching from API:", ipAddress);
      const apiKey = process.env.GEOLOCATION_API_KEY;
      if (!apiKey) {
        console.error("GEOLOCATION_API_KEY is not set");
        return NextResponse.json(
          {
            success: false,
            error: "Server configuration error: API key missing",
          },
          { status: 500 }
        );
      }
      const geoApiUrl = `https://ipgeolocation.abstractapi.com/v1/?api_key=${apiKey}&ip_address=${ipAddress}`;
      const geoResponse = await fetch(geoApiUrl);

      if (!geoResponse.ok) {
        const errorText = await geoResponse.text();
        console.error(
          `Geolocation API request failed: ${geoResponse.status} ${errorText}`
        );
        return NextResponse.json(
          {
            success: false,
            error: `Geolocation API request failed: ${geoResponse.status} ${errorText}`,
          },
          { status: geoResponse.status }
        );
      }

      const geolocationApiData = await geoResponse.json();

      finalGeolocationData = {
        latitude: geolocationApiData.latitude,
        longitude: geolocationApiData.longitude,
        city: geolocationApiData.city,
        country: geolocationApiData.country,
        countryFlag: geolocationApiData.flag?.png,
      };

      try {
        await createIpLocation({
          ipAddress: ipAddress,
          latitude: geolocationApiData.latitude,
          longitude: geolocationApiData.longitude,
          country: geolocationApiData.country,
          countryFlag: geolocationApiData.flag?.png,
          rawData: emailData,
          emailCount: 1,
        });
        currentEmailCount = 1;
        console.log("Stored new IP geolocation data in DB:", ipAddress);
      } catch (dbInsertError) {
        console.error("Database insert error:", dbInsertError);
      }
    }

    const responsePayload = {
      success: true,
      source: source,
      originalEmailData: {
        From: emailData.From,
        Subject: emailData.Subject,
      },
      geolocation: finalGeolocationData,
      emailCount: currentEmailCount,
      ipAddress: ipAddress,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Error processing webhook:", error);
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
