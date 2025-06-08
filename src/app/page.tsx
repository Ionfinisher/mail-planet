"use client";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const EmailAddress =
    "2446e801971b017b07291e89d25592b3@inbound.postmarkapp.com";

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-cyan-600 to-cyan-100 dark:from-slate-800 dark:to-neutral-900 text-white">
      <header className="py-4 px-4 flex justify-between items-center backdrop-blur-sm shadow-lg">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Image
            src="/mailplanet-logo.svg"
            alt="MailPlanet Logo"
            width={50}
            height={50}
          />
          <h1 className="text-4xl font-bold">MailPlanet</h1>
        </div>
        <p className="text-lg">Tracking mail origins across the globe</p>
        <Link
          href="https://github.com/Ionfinisher/mailp-lanet"
          target="_blank"
          className="px-2 py-2 font-medium rounded-lg border border-gray-300 hover:shadow-2xl transition-colors duration-150 ease-in-out"
        >
          <Image
            src="/code-circle.svg"
            alt="Code Icon"
            width={25}
            height={25}
          />
        </Link>
      </header>

      <section className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          <div className="md:w-1/2 text-center md:text-left">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-semibold mb-4">
              Visualize An Email Universe
            </h2>
            <p className="text-md lg:text-lg mb-8">
              See where emails sent to the postmark inbound are coming from with
              an interactive global map.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-6">
              <Link
                href="/map"
                className="w-full sm:w-auto px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 ease-in-out text-lg text-center"
              >
                Explore the Live Map
              </Link>
              <a
                href={`mailto:${EmailAddress}?subject=Testing MailPlanet Inbound&body=This is a test email for MailPlanet!`}
                className="w-full sm:w-auto px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 ease-in-out text-lg text-center"
              >
                Send an Email
              </a>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-400">
              (Send an email to{" "}
              <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded text-xs">
                {EmailAddress}
              </code>{" "}
              to see it appear on the map!)
            </p>
          </div>

          {/* Right Column: Image */}
          <div className="md:w-1/2 mt-8 md:mt-0">
            <div className="w-full max-w-xl mx-auto h-auto rounded-xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10">
              <Image
                src="/mailplanet-screenshot.png"
                alt="Map Snapshot of MailPlanet"
                width={1200}
                height={750}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="py-3 px-4 text-black dark:text-white text-center text-sm border-t border-gray-400">
        <p>🌍 MailPlanet.</p>
        <p className="mt-1 flex items-center justify-center">
          Powered by
          <Image
            src={"/postmark-icon.svg"}
            alt="Postmark Logo"
            width={30}
            height={30}
            className="ml-2 h-6"
            priority
          />
          , built with ✨ by Teddy.
        </p>
      </footer>
    </main>
  );
}
