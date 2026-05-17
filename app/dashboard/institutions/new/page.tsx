import { getCurrentUser, hasPermission } from "@/lib/auth";
import { InstitutionForm } from "@/components/institutions/institution-form";
import { redirect } from "next/navigation";

export default async function NewInstitutionPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");
    if (!hasPermission(user, "institutions.manage")) redirect("/dashboard/institutions");

    return (
        <div className="space-y-6">
            <InstitutionForm />
        </div>
    );
}
