import { getCurrentUser } from "@/lib/auth";
import { InstitutionForm } from "@/components/institutions/institution-form";
import { redirect } from "next/navigation";

export default async function NewInstitutionPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    return (
        <div className="space-y-6">
            <InstitutionForm />
        </div>
    );
}
