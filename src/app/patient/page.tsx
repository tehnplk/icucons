import type { Metadata } from "next";

import { PatientCrud } from "@/app/patient/patient-crud";
import { fetchPatientList, fetchPatientOptions } from "@/lib/patient";

export const metadata: Metadata = {
  title: "Patient Registry",
  description: "Manage patient registration records with modal CRUD.",
};

export default async function PatientPage() {
  const [initialPatients, options] = await Promise.all([
    fetchPatientList(),
    fetchPatientOptions(),
  ]);

  return (
    <PatientCrud
      initialPatients={initialPatients}
      hospitals={options.hospitals}
      preNames={options.preNames}
      genders={options.genders}
      bloodTypes={options.bloodTypes}
      dischargeTypes={options.dischargeTypes}
    />
  );
}

