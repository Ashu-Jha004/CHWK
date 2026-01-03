"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea"; // Assuming exists or I'll use native
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Complaint {
  id: string;
  complaintNumber: string;
  subject: string;
  category: string;
  status: string; // SUBMITTED, UNDER_REVIEW, IN_PROGRESS, RESOLVED, REJECTED
  priority: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  description: string;
  resolution?: string;
  contactPhone: string;
}

interface ComplaintsManagementTabProps {
  businessId: string;
}

export function ComplaintsManagementTab({ businessId }: ComplaintsManagementTabProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog States
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);

  // Resolution Form
  const [resolutionNote, setResolutionNote] = useState("");
  const [newStatus, setNewStatus] = useState("RESOLVED");

  useEffect(() => {
    fetchComplaints();
  }, [businessId]);

  async function fetchComplaints() {
    try {
      const res = await fetch(`/api/complaints?filter=business_complaints&businessId=${businessId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setComplaints(data);
    } catch (error) {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus() {
    if (!selectedComplaint) return;

    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          resolution: resolutionNote
        })
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success(`Complaint marked as ${newStatus}`);
      setIsResolveOpen(false);
      fetchComplaints(); // Refresh
    } catch (error) {
      toast.error("Failed to update status");
    }
  }

  const filteredComplaints = complaints.filter(c =>
    c.complaintNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'SUBMITTED': return <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">New</Badge>;
        case 'UNDER_REVIEW': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Reviewing</Badge>;
        case 'IN_PROGRESS': return <Badge variant="secondary" className="bg-orange-100 text-orange-800">In Progress</Badge>;
        case 'RESOLVED': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Resolved</Badge>;
        case 'REJECTED': return <Badge variant="destructive">Rejected</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Complaints</h2>
        <div className="flex items-center space-x-2">
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search complaints..."
                    className="pl-8 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Complaint ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell>
                </TableRow>
            ) : filteredComplaints.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No complaints found.
                    </TableCell>
                </TableRow>
            ) : (
                filteredComplaints.map((complaint) => (
                <TableRow key={complaint.id}>
                    <TableCell className="font-medium">{complaint.complaintNumber}</TableCell>
                    <TableCell>{complaint.subject}</TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span>{complaint.user.firstName} {complaint.user.lastName}</span>
                            <span className="text-xs text-muted-foreground">{complaint.user.email}</span>
                        </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                    <TableCell>{new Date(complaint.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                            setSelectedComplaint(complaint);
                            setIsViewOpen(true);
                        }}>
                            <FileText className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                            setSelectedComplaint(complaint);
                            setNewStatus("IN_PROGRESS");
                            setIsResolveOpen(true);
                        }}>
                             <AlertCircle className="mr-2 h-4 w-4" /> Update Status
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* VIEW DETAILS DIALOG */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Complaint Details</DialogTitle>
                <DialogDescription>{selectedComplaint?.complaintNumber}</DialogDescription>
            </DialogHeader>
            {selectedComplaint && (
                <div className="space-y-4">
                    <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Subject</h4>
                        <p>{selectedComplaint.subject}</p>
                    </div>
                    <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Description</h4>
                        <p className="text-sm bg-muted p-3 rounded-md">{selectedComplaint.description}</p>
                    </div>
                    <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Contact Info</h4>
                        <p className="text-sm">{selectedComplaint.contactPhone}</p>
                    </div>
                     {selectedComplaint.resolution && (
                         <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                            <h4 className="font-medium text-sm text-green-700 dark:text-green-400 mb-1">Resolution</h4>
                            <p className="text-sm text-green-800 dark:text-green-300">{selectedComplaint.resolution}</p>
                        </div>
                    )}
                </div>
            )}
        </DialogContent>
      </Dialog>

      {/* UPDATE STATUS DIALOG */}
      <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Update Complaint Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Resolution Note / Admin Comment</Label>
                    <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Add a note about the update..."
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsResolveOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateStatus}>Update Status</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
