"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, X, Loader2, Receipt, CreditCard, FileText } from "lucide-react";
import { toast } from "sonner";
import { updateOrderDocument } from "@/app/actions/purchases";

const iconMap = {
    receipt: Receipt,
    creditCard: CreditCard,
    fileText: FileText,
};

interface DocumentUploadProps {
    label: string;
    iconName: "receipt" | "creditCard" | "fileText";
    currentUrl?: string | null;
    orderId: string;
    docType: "invoice" | "creditNote" | "debitNote";
}

export function DocumentUpload({ label, iconName, currentUrl, orderId, docType }: DocumentUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState("");
    const Icon = iconMap[iconName];

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setFileName(file.name);

        try {
            // Read file as base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                
                await updateOrderDocument(orderId, docType, base64);
                toast.success(`${label} subido correctamente`);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            toast.error("Error al subir el documento");
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = async () => {
        try {
            await updateOrderDocument(orderId, docType, null);
            setFileName("");
            toast.success(`${label} eliminado`);
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    const hasDocument = currentUrl || fileName;

    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
            </Label>
            {hasDocument ? (
                <Card className="bg-muted/50">
                    <CardContent className="p-3 flex items-center justify-between gap-2">
                        <a 
                            href={currentUrl || "#"} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 overflow-hidden hover:text-primary transition-colors flex-1"
                        >
                            <File className="h-4 w-4 shrink-0" />
                            <span className="text-sm truncate">
                                {fileName || "Ver documento"}
                            </span>
                        </a>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="shrink-0 h-8 w-8 text-destructive"
                            onClick={handleRemove}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="relative">
                    <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full pointer-events-none"
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Subiendo...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Subir {label.toLowerCase()}
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}