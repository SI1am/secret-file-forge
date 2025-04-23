
import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/**
 * Basic masking functions (ported from user snippet)
 */
function maskEmail(email: string): string {
  if (typeof email !== "string" || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  if (local.length <= 4) return "***@" + domain;
  const masked = local.slice(0, 2) + "***" + local.slice(-2);
  return `${masked}@${domain}`;
}

function maskPhone(phone: string): string {
  if (typeof phone !== "string") return phone;
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1***$3");
}

function maskCreditCard(card: string): string {
  if (typeof card !== "string") return card;
  return card.replace(/(\d{4})(\d{8,12})(\d{4})/, "$1********$3");
}

function maskPartial(str: string): string {
  if (typeof str !== "string") return str;
  if (str.length <= 4) return "***";
  return str.slice(0, 2) + "***" + str.slice(-2);
}

type MaskType = "email" | "phone" | "creditCard" | "partial";

export const ExcelDataMasker: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [columnName, setColumnName] = useState("");
  const [maskType, setMaskType] = useState<MaskType>("email");
  const [status, setStatus] = useState("");

  const processFile = () => {
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files?.[0] || !columnName) {
      setStatus("Please upload a file and enter a column name.");
      toast.error("Upload a file and enter a column name.");
      return;
    }

    setFileName(fileInput.files[0].name);

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = new Uint8Array((e.target as any).result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        jsonData.forEach(row => {
          if (row[columnName]) {
            switch (maskType) {
              case "email":
                row[columnName] = maskEmail(row[columnName]);
                break;
              case "phone":
                row[columnName] = maskPhone(row[columnName]);
                break;
              case "creditCard":
                row[columnName] = maskCreditCard(row[columnName]);
                break;
              case "partial":
                row[columnName] = maskPartial(row[columnName]);
                break;
              // no default
            }
          }
        });

        const newSheet = XLSX.utils.json_to_sheet(jsonData);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);

        const downloadFileName = fileName ? `masked_${fileName}` : "masked_data.xlsx";
        XLSX.writeFile(newWorkbook, downloadFileName);

        setStatus("✅ File processed and downloaded!");
        toast.success("Masked file downloaded!");
      } catch (err) {
        setStatus("❌ Failed to process file");
        toast.error("Error processing file");
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
  };

  return (
    <Card className="max-w-xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Excel Data Masker (Local Utility)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Label className="font-medium">Upload Excel File</Label>
          <Input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="mb-2"
          />
          <Label>Column Name to Mask</Label>
          <Input
            value={columnName}
            onChange={e => setColumnName(e.target.value)}
            placeholder="e.g. Email"
          />
          <Label>Mask Type</Label>
          <select
            className="border rounded px-2 py-1"
            value={maskType}
            onChange={e => setMaskType(e.target.value as MaskType)}
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="creditCard">Credit Card</option>
            <option value="partial">Partial</option>
          </select>
          <Button onClick={processFile} className="w-full mt-2">
            Mask and Download
          </Button>
          <span className="text-sm text-muted-foreground">{status}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExcelDataMasker;
