"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertCircle,
  Building,
  Download,
  Eye,
  File,
  FileText,
  ImageIcon,
  MoreHorizontal,
  Search,
  Trash,
  Upload,
  X,
} from "lucide-react"
import { OrganizationSelector } from "./organization-selector"
import { useToast } from "@/hooks/use-toast"

const organizations = [
  { id: "org_1", name: "Acme Inc.", members: 12 },
  { id: "org_2", name: "Globex Corporation", members: 8 },
  { id: "org_3", name: "Initech", members: 5 },
]

const mockFiles = [
  {
    id: "file_1",
    name: "product-documentation.pdf",
    type: "application/pdf",
    size: 2500000,
    uploadedBy: "john@example.com",
    uploadedAt: "2023-06-15T14:32:45Z",
    organization: "Acme Inc.",
  },
  {
    id: "file_2",
    name: "logo.png",
    type: "image/png",
    size: 350000,
    uploadedBy: "jane@example.com",
    uploadedAt: "2023-06-20T09:15:30Z",
    organization: "Acme Inc.",
  },
  {
    id: "file_3",
    name: "api-documentation.md",
    type: "text/markdown",
    size: 120000,
    uploadedBy: "bob@example.com",
    uploadedAt: "2023-06-25T11:45:12Z",
    organization: "Globex Corporation",
  },
  {
    id: "file_4",
    name: "presentation.pptx",
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    size: 4800000,
    uploadedBy: "alice@example.com",
    uploadedAt: "2023-06-28T16:20:45Z",
    organization: "Initech",
  },
  {
    id: "file_5",
    name: "data-export.csv",
    type: "text/csv",
    size: 1200000,
    uploadedBy: "john@example.com",
    uploadedAt: "2023-07-01T10:05:22Z",
    organization: "Acme Inc.",
  },
]

export function FilesView() {
  const [files, setFiles] = useState(mockFiles)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrganization, setSelectedOrganization] = useState(organizations[0])
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const { toast } = useToast()

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      searchQuery === "" ||
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesOrg = file.organization === selectedOrganization.name

    return matchesSearch && matchesOrg
  })

  const handleOrganizationChange = (org) => {
    setSelectedOrganization(org)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "The maximum file size is 50MB.",
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to upload.",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 300)

    setTimeout(() => {
      clearInterval(interval)
      setUploadProgress(100)
      setIsUploading(false)

      const newFile = {
        id: `file_${Date.now()}`,
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        uploadedBy: "current.user@example.com",
        uploadedAt: new Date().toISOString(),
        organization: selectedOrganization.name,
      }

      setFiles([newFile, ...files])
      setSelectedFile(null)
      setUploadDialogOpen(false)

      toast({
        variant: "success",
        title: "File uploaded",
        description: `${selectedFile.name} has been uploaded successfully.`,
      })
    }, 3000)
  }

  const handleDeleteFile = (fileId) => {
    setFiles(files.filter((file) => file.id !== fileId))
    toast({
      title: "File deleted",
      description: "The file has been deleted successfully.",
    })
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />
    } else if (fileType === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500" />
    } else if (fileType.includes("spreadsheet") || fileType === "text/csv") {
      return <FileText className="h-5 w-5 text-green-500" />
    } else if (fileType.includes("presentation")) {
      return <FileText className="h-5 w-5 text-orange-500" />
    } else {
      return <File className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <OrganizationSelector
        organizations={organizations}
        selectedOrganization={selectedOrganization}
        onOrganizationChange={handleOrganizationChange}
      />

      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Building className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Organization Context</h3>
              <p className="text-sm text-muted-foreground">
                Managing files for <span className="font-medium">{selectedOrganization.name}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Files</h2>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </div>

      <Card className="shadow-sm border-border bg-white">
        <CardHeader className="flex flex-row items-center border-b">
          <div className="space-y-1.5">
            <CardTitle>File Storage</CardTitle>
            <CardDescription>Upload and manage files for your organization.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative flex-1 my-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search files..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Uploaded At</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No files found. Upload a file to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredFiles.map((file) => (
                  <TableRow key={file.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <span className="font-medium">{file.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>{file.uploadedBy}</TableCell>
                    <TableCell>{formatDate(file.uploadedAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteFile(file.id)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>Upload a file to your organization's storage.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="flex-1"
                  disabled={isUploading}
                />
                {selectedFile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedFile(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ""
                      }
                    }}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Maximum file size: 50MB</p>
            </div>

            {selectedFile && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Selected File:</span>
                  <Badge variant="outline">{formatFileSize(selectedFile.size)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  {getFileIcon(selectedFile.type)}
                  <span className="text-sm truncate">{selectedFile.name}</span>
                </div>
              </div>
            )}

            {isUploading && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uploading...</span>
                  <span className="text-sm">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {!selectedFile && (
              <div className="flex items-center p-3 border rounded-md bg-amber-50 text-amber-800 gap-2">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">Please select a file to upload.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
