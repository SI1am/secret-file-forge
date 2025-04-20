
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Download, Lock, Check, File } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { autoMaskSensitiveData } from "@/utils/dataMasking";

const DataMaskingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMasked, setIsMasked] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);
  const [maskedData, setMaskedData] = useState<Record<string, any>[]>([]);

  // In a real app, this would fetch the file data from your backend
  useEffect(() => {
    // Simulate API call to get file data
    setTimeout(() => {
      // Mock data for an Excel file
      const mockColumns = [
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Address",
        "SSN",
        "Credit Card",
        "Health ID",
        "Department",
        "Salary"
      ];
      
      const mockData = [
        {
          "First Name": "John",
          "Last Name": "Doe",
          "Email": "john.doe@example.com",
          "Phone": "555-123-4567",
          "Address": "123 Main St, Anytown, USA",
          "SSN": "123-45-6789",
          "Credit Card": "4111-1111-1111-1111",
          "Health ID": "HC123456789",
          "Department": "Engineering",
          "Salary": "$85,000"
        },
        {
          "First Name": "Jane",
          "Last Name": "Smith",
          "Email": "jane.smith@example.com",
          "Phone": "555-987-6543",
          "Address": "456 Elm St, Othertown, USA",
          "SSN": "987-65-4321",
          "Credit Card": "5555-5555-5555-4444",
          "Health ID": "HC987654321",
          "Department": "Marketing",
          "Salary": "$78,000"
        },
        {
          "First Name": "Robert",
          "Last Name": "Johnson",
          "Email": "robert.johnson@example.com",
          "Phone": "(555) 222-3333",
          "Address": "789 Oak St, Somewhere, USA",
          "SSN": "456-78-9012",
          "Credit Card": "3782-822463-10005",
          "Health ID": "HC456789012",
          "Department": "Finance",
          "Salary": "$92,000"
        }
      ];
      
      setColumns(mockColumns);
      setPreviewData(mockData);
      // Pre-select sensitive columns
      setSelectedColumns(["Email", "Phone", "SSN", "Credit Card", "Health ID"]);
      setIsLoading(false);
    }, 1500);
  }, [id]);

  const handleColumnToggle = (column: string) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(col => col !== column) 
        : [...prev, column]
    );
  };

  const handleMaskData = () => {
    if (selectedColumns.length === 0) {
      toast.warning("Please select at least one column to mask");
      return;
    }

    setIsProcessing(true);
    toast.info("Masking sensitive data...");

    // Simulate processing delay
    setTimeout(() => {
      try {
        // Process data masking
        const masked = previewData.map(row => {
          const newRow = { ...row };
          selectedColumns.forEach(column => {
            if (typeof newRow[column] === 'string') {
              newRow[column] = autoMaskSensitiveData(newRow[column]);
            }
          });
          return newRow;
        });

        setMaskedData(masked);
        setIsMasked(true);
        toast.success("Data masking complete!");
      } catch (error) {
        console.error("Error masking data:", error);
        toast.error("Failed to mask data");
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  const handleDownload = () => {
    if (!isMasked) {
      toast.warning("Please mask the data first");
      return;
    }

    // In a real app, this would generate and download an Excel file
    toast.success("Masked file downloaded successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Data Masking</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <File className="h-5 w-5 mr-2 text-primary" />
              Select Columns to Mask
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-8 bg-muted rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {columns.map(column => (
                  <div key={column} className="flex items-center space-x-2">
                    <Checkbox
                      id={`column-${column}`}
                      checked={selectedColumns.includes(column)}
                      onCheckedChange={() => handleColumnToggle(column)}
                    />
                    <Label 
                      htmlFor={`column-${column}`}
                      className="cursor-pointer flex-1"
                    >
                      {column}
                    </Label>
                  </div>
                ))}

                <div className="pt-4 space-y-3">
                  <Button
                    onClick={handleMaskData}
                    disabled={isProcessing || selectedColumns.length === 0}
                    className="w-full"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {isProcessing ? "Processing..." : "Mask Selected Data"}
                  </Button>
                  <Button
                    onClick={handleDownload}
                    disabled={!isMasked}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Masked File
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              {isMasked ? "Masked Data Preview" : "Data Preview"}
              {isMasked && (
                <span className="ml-2 inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  <Check className="h-3 w-3 mr-1" /> Masked
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[500px]">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 sticky top-0">
                  <tr>
                    {isLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <th key={i} className="p-3">
                          <div className="h-4 bg-muted animate-pulse rounded"></div>
                        </th>
                      ))
                    ) : (
                      columns.map(column => (
                        <th 
                          key={column} 
                          className={`p-3 text-left text-xs font-medium uppercase tracking-wider ${
                            selectedColumns.includes(column) ? 
                            'text-primary' : 'text-muted-foreground'
                          }`}
                        >
                          {column}
                          {selectedColumns.includes(column) && (
                            <Lock className="h-3 w-3 inline ml-1" />
                          )}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    Array(3).fill(0).map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {Array(5).fill(0).map((_, colIndex) => (
                          <td key={colIndex} className="p-3">
                            <div className="h-4 bg-muted/50 animate-pulse rounded"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    (isMasked ? maskedData : previewData).map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-muted/20' : ''}>
                        {columns.map(column => (
                          <td key={column} className="p-3 text-sm">
                            {row[column]}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataMaskingPage;
