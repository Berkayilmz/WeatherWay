import axios from "axios";

export const getPolylineCoords = async (startCoords, endCoords) => {
  const OSRM_URL = `https://router.project-osrm.org/route/v1/driving/${startCoords.longitude},${startCoords.latitude};${endCoords.longitude},${endCoords.latitude}?overview=full&geometries=geojson&steps=true`;

  const response = await axios.get(OSRM_URL);
  const route = response.data.routes[0];
  if (!route) throw new Error("Rota bulunamadı.");

  return route.geometry.coordinates.map(coord => ({
    latitude: coord[1],
    longitude: coord[0],
  }));
};

export const getRouteSegments = async (coords, travelDate, departureTime) => {
  const [startLat, startLon] = [coords[0].latitude, coords[0].longitude];
  const [endLat, endLon] = [coords[coords.length - 1].latitude, coords[coords.length - 1].longitude];

  const OSRM_URL = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson&steps=true`;
  const response = await axios.get(OSRM_URL);
  const steps = response.data.routes[0]?.legs[0]?.steps || [];

  let totalDuration = 0;
  let cumulativeDistance = 0;
  let startTime = new Date(travelDate);

  if (departureTime) {
    const [hour, minute] = departureTime.split(":").map(Number);
    startTime.setHours(hour, minute, 0);
  }

  return steps.map(step => {
    const [lon, lat] = step.maneuver.location;
    const name = step.name || "İsimsiz Yol";
    const distanceKm = step.distance / 1000;
    totalDuration += step.duration;
    cumulativeDistance += step.distance;

    const estimatedArrival = new Date(startTime.getTime() + totalDuration * 1000);
    const estimatedArrivalTR = new Date(estimatedArrival.getTime() + 3 * 60 * 60 * 1000);
    const formattedArrivalTime = estimatedArrivalTR.toISOString().replace("T", " ").substring(0, 19);

    const cumulativeMinutes = Math.floor(totalDuration / 60);
    const cumulativeHours = Math.floor(cumulativeMinutes / 60);
    const remainingCumulativeMinutes = cumulativeMinutes % 60;
    const formattedCumulativeDuration =
      cumulativeHours > 0
        ? `${cumulativeHours} saat${remainingCumulativeMinutes > 0 ? ` ${remainingCumulativeMinutes} dakika` : ""}`
        : `${cumulativeMinutes} dakika`;

    const totalMinutes = Math.floor(step.duration / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const formattedDuration =
      hours > 0
        ? `${hours} saat${minutes > 0 ? ` ${minutes} dakika` : ""}`
        : `${minutes} dakika`;

    return {
      name,
      latitude: lat,
      longitude: lon,
      distance: distanceKm,
      cumulativeDistance: parseFloat(cumulativeDistance / 1000),
      duration: step.duration,
      formattedDuration,
      formattedArrivalTime,
      formattedCumulativeDuration,
    };
  });
};