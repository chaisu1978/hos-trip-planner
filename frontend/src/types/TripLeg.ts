export type LegType = "drive" | "rest" | "fuel" | "break" | "pickup" | "dropoff" | "other";

export interface TripLeg {
  id: number;
  leg_type: LegType;
  start_lat: number | null;
  start_lon: number | null;
  end_lat: number | null;
  end_lon: number | null;
  duration_hours?: number;
  distance_miles?: number;
  start_label?: string;
  end_label?: string;
  notes?: string;
  polyline_geometry?: [number, number][];
  steps?: {
    start_lat: number;
    start_lon: number;
    end_lat: number;
    end_lon: number;
    instruction?: string;
  }[];
}
