export interface ShipmentStage {
  id: string;
  label: string;
}

export const SHIPMENT_STAGES: ShipmentStage[] = [
  { id: "placed", label: "Order placed" },
  { id: "origin", label: "Preparing at origin warehouse" },
  { id: "transit", label: "In transit" },
  { id: "customs", label: "Customs clearance" },
  { id: "hub", label: "Arrived at US hub" },
  { id: "delivery", label: "Out for delivery" },
  { id: "delivered", label: "Delivered" },
];

export interface ShipmentProgress {
  dayIndex: number;
  totalDays: number;
  fraction: number;
  currentStageIndex: number;
  etaDate: string;
  position: [number, number];
}

/** Linear lerp between origin and destination coordinates — a simplified
 * straight-line route for the demo map, not a real shipping path. */
export function computeShipmentProgress(
  dayIndex: number,
  totalDays: number,
  origin: [number, number],
  destination: [number, number],
  startDate: Date
): ShipmentProgress {
  const clampedDay = Math.max(0, Math.min(dayIndex, totalDays));
  const fraction = totalDays > 0 ? clampedDay / totalDays : 1;
  const currentStageIndex = Math.min(
    SHIPMENT_STAGES.length - 1,
    Math.floor(fraction * (SHIPMENT_STAGES.length - 1))
  );
  const position: [number, number] = [
    origin[0] + (destination[0] - origin[0]) * fraction,
    origin[1] + (destination[1] - origin[1]) * fraction,
  ];
  const eta = new Date(startDate);
  eta.setDate(eta.getDate() + totalDays);

  return {
    dayIndex: clampedDay,
    totalDays,
    fraction,
    currentStageIndex,
    etaDate: eta.toISOString().slice(0, 10),
    position,
  };
}
