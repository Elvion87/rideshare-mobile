import type { Udhetim } from "@/lib/udhetimet";

export type StatusKerkese = "ne pritje" | "pranuar";

export type KerkesaIme = {
  id: string;
  status: StatusKerkese;
};

export type KerkesaShoferi = KerkesaIme & {
  udhetar: string;
};

export type GjendjaUdhetimit = {
  udhetim: Udhetim;
  roli: "udhetar" | "shofer";
  kerkesaIme: KerkesaIme | null;
  kerkesat: KerkesaShoferi[];
};
