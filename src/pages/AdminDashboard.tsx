import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DollarSign, 
  Users, 
  CreditCard, 
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter
} from "lucide-react";
import { paymentFirebaseService } from "@/services/paymentFirebase";
import { yocoPaymentService } from "@/services/yocoPayment";
import { PaymentRecord, RefundRequest } from "@/types/payment";
import { useToast } from "@/components/ui/use-toast";

// Simple date formatting function to replace date-fns
const formatDistanceToNow = (date: Date, options?: { addSuffix?: boolean }) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return options?.addSuffix ? 'just now' : 'now';
  if (diffMinutes < 60) return `${diffMinutes}m${options?.addSuffix ? ' ago' : ''}`;
  if (diffHours < 24) return `${diffHours}h${options?.addSuffix ? ' ago' : ''}`;
  if (diffDays < 30) return `${diffDays}d${options?.addSuffix ? ' ago' : ''}`;
  return date.toLocaleDateString();
};

export const AdminDashboard = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [selectedRefundRequest, setSelectedRefundRequest] = useState<RefundRequest | null>(null);
  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [paymentsData, refundRequestsData] = await Promise.all([
        paymentFirebaseService.getAllPayments(),
        paymentFirebaseService.getAllRefundRequests()
      ]);

      setPayments(paymentsData);
      setRefundRequests(refundRequestsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefund = async (payment: PaymentRecord, reason: string, adminNotes?: string) => {
    try {
      // Check if refund is still available
      if (payment.paidAt && !yocoPaymentService.isRefundAvailable(payment.paidAt)) {
        toast({
          title: "Refund Not Available",
          description: "Refund period has expired (7 days limit).",
          variant: "destructive"
        });
        return;
      }

      // Process refund with Yoco
      const refundResult = await yocoPaymentService.refundPayment(payment.checkoutId, {
        amount: payment.amount,
        metadata: { reason, adminNotes }
      });

      // Update payment record
      await paymentFirebaseService.updatePaymentRecord(payment.id, {
        status: 'completed', // Keep as completed but add refund info
        refundedAt: new Date(),
        refundAmount: payment.amount,
        refundId: refundResult.refundId,
        refundReason: reason
      });

      toast({
        title: "Refund Processed",
        description: `Refund of R${(payment.amount / 100).toFixed(2)} processed successfully.`,
      });

      // Reload data
      loadData();
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: "Refund Failed",
        description: "Failed to process refund. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRefundRequest = async (refundRequest: RefundRequest, action: 'approve' | 'reject', adminNotes: string) => {
    try {
      if (action === 'approve') {
        // Find the related payment
        const payment = payments.find(p => p.id === refundRequest.paymentId);
        if (!payment) {
          throw new Error('Payment not found');
        }

        await handleRefund(payment, refundRequest.reason, adminNotes);
      }

      // Update refund request status
      await paymentFirebaseService.updateRefundRequest(refundRequest.id, {
        status: action === 'approve' ? 'processed' : 'rejected',
        processedAt: new Date(),
        adminNotes
      });

      toast({
        title: `Refund Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `The refund request has been ${action}d.`,
      });

      // Reload data
      loadData();
    } catch (error) {
      console.error('Error handling refund request:', error);
      toast({
        title: "Error",
        description: "Failed to process refund request.",
        variant: "destructive"
      });
    }
  };

  // Filter payments based on search and status
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchTerm === '' || 
      payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.checkoutId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    totalRevenue: payments
      .filter(p => p.status === 'completed' && !p.refundedAt)
      .reduce((sum, p) => sum + p.amount, 0),
    totalRefunded: payments
      .filter(p => p.refundedAt)
      .reduce((sum, p) => sum + (p.refundAmount || 0), 0),
    activeSubscriptions: payments.filter(p => p.status === 'completed' && !p.refundedAt).length,
    pendingRefunds: refundRequests.filter(r => r.status === 'pending').length
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'completed': { variant: 'default' as const, icon: CheckCircle, color: 'text-green-500' },
      'processing': { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-500' },
      'failed': { variant: 'destructive' as const, icon: XCircle, color: 'text-red-500' },
      'cancelled': { variant: 'outline' as const, icon: XCircle, color: 'text-gray-500' }
    };

    const config = variants[status as keyof typeof variants] || variants.processing;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage payments, subscriptions, and refunds</p>
        </div>
        
        <Button onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{(stats.totalRevenue / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Currently active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{(stats.totalRefunded / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Processed refunds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Refunds</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRefunds}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="refunds">Refund Requests</TabsTrigger>
        </TabsList>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by email or checkout ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payments Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.userEmail}</div>
                        <div className="text-xs text-muted-foreground">{payment.checkoutId}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="font-medium">
                      R{(payment.amount / 100).toFixed(2)}
                      {payment.refundedAt && (
                        <Badge variant="outline" className="ml-2">Refunded</Badge>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="secondary">
                        {payment.subscriptionType}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-xs">
                        <div>{payment.createdAt.toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          {formatDistanceToNow(payment.createdAt, { addSuffix: true })}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Payment Details</DialogTitle>
                            </DialogHeader>
                            {selectedPayment && (
                              <PaymentDetailsDialog 
                                payment={selectedPayment} 
                                onRefund={handleRefund}
                              />
                            )}
                          </DialogContent>
                        </Dialog>

                        {payment.status === 'completed' && !payment.refundedAt && payment.paidAt && yocoPaymentService.isRefundAvailable(payment.paidAt) && (
                          <RefundDialog 
                            payment={payment} 
                            onRefund={handleRefund}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Refund Requests Tab */}
        <TabsContent value="refunds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Refund Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {refundRequests.filter(r => r.status === 'pending').length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No pending refund requests
                </p>
              ) : (
                <div className="space-y-4">
                  {refundRequests
                    .filter(r => r.status === 'pending')
                    .map((request) => (
                      <RefundRequestCard 
                        key={request.id}
                        request={request}
                        onHandle={handleRefundRequest}
                      />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Payment Details Dialog Component
const PaymentDetailsDialog = ({ 
  payment, 
  onRefund 
}: { 
  payment: PaymentRecord; 
  onRefund: (payment: PaymentRecord, reason: string, adminNotes?: string) => void;
}) => {
  const [refundReason, setRefundReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const canRefund = payment.status === 'completed' && 
                   !payment.refundedAt && 
                   payment.paidAt && 
                   yocoPaymentService.isRefundAvailable(payment.paidAt);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Payment Information</h4>
          <div className="space-y-2 text-sm">
            <div><strong>ID:</strong> {payment.id}</div>
            <div><strong>Checkout ID:</strong> {payment.checkoutId}</div>
            <div><strong>Amount:</strong> R{(payment.amount / 100).toFixed(2)}</div>
            <div><strong>Status:</strong> {payment.status}</div>
            <div><strong>Plan:</strong> {payment.subscriptionType}</div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">User Information</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Email:</strong> {payment.userEmail}</div>
            <div><strong>User ID:</strong> {payment.userId}</div>
            <div><strong>Created:</strong> {payment.createdAt.toLocaleString()}</div>
            {payment.paidAt && (
              <div><strong>Paid:</strong> {payment.paidAt.toLocaleString()}</div>
            )}
          </div>
        </div>
      </div>

      {payment.refundedAt ? (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2">Refund Information</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <div><strong>Refunded:</strong> {payment.refundedAt.toLocaleString()}</div>
            <div><strong>Amount:</strong> R{((payment.refundAmount || 0) / 100).toFixed(2)}</div>
            <div><strong>Reason:</strong> {payment.refundReason}</div>
            {payment.refundId && <div><strong>Refund ID:</strong> {payment.refundId}</div>}
          </div>
        </div>
      ) : canRefund ? (
        <div className="space-y-3">
          <div>
            <Label htmlFor="refundReason">Refund Reason</Label>
            <Textarea
              id="refundReason"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Enter reason for refund..."
            />
          </div>
          
          <div>
            <Label htmlFor="adminNotes">Admin Notes</Label>
            <Textarea
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes..."
            />
          </div>
          
          <Button
            onClick={() => onRefund(payment, refundReason, adminNotes)}
            disabled={!refundReason.trim()}
            variant="destructive"
            className="w-full"
          >
            Process Refund - R{(payment.amount / 100).toFixed(2)}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Refund expires in {yocoPaymentService.getRefundDaysRemaining(payment.paidAt!)} days
          </p>
        </div>
      ) : (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-red-700 text-sm">
            {payment.paidAt && !yocoPaymentService.isRefundAvailable(payment.paidAt) 
              ? 'Refund period has expired (7 days limit)' 
              : 'Refund not available for this payment'}
          </p>
        </div>
      )}
    </div>
  );
};

// Refund Dialog Component
const RefundDialog = ({ 
  payment, 
  onRefund 
}: { 
  payment: PaymentRecord; 
  onRefund: (payment: PaymentRecord, reason: string, adminNotes?: string) => void;
}) => {
  const [refundReason, setRefundReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Refund
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Refunding R{(payment.amount / 100).toFixed(2)} for {payment.userEmail}
            </p>
          </div>
          
          <div>
            <Label htmlFor="refundReason">Refund Reason</Label>
            <Textarea
              id="refundReason"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Enter reason for refund..."
            />
          </div>
          
          <div>
            <Label htmlFor="adminNotes">Admin Notes (Internal)</Label>
            <Input
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes..."
            />
          </div>
          
          <Button
            onClick={() => onRefund(payment, refundReason, adminNotes)}
            disabled={!refundReason.trim()}
            variant="destructive"
            className="w-full"
          >
            Process Refund
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Refund Request Card Component  
const RefundRequestCard = ({ 
  request, 
  onHandle 
}: { 
  request: RefundRequest; 
  onHandle: (request: RefundRequest, action: 'approve' | 'reject', adminNotes: string) => void;
}) => {
  const [adminNotes, setAdminNotes] = useState('');

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{request.status}</Badge>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(request.requestedAt, { addSuffix: true })}
              </span>
            </div>
            
            <div>
              <p className="font-medium">{request.userEmail}</p>
              <p className="text-sm text-muted-foreground">
                Requesting refund of R{(request.refundAmount / 100).toFixed(2)}
              </p>
            </div>
            
            <div>
              <p className="text-sm"><strong>Reason:</strong> {request.reason}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <Input
                placeholder="Admin notes..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-48"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onHandle(request, 'approve', adminNotes)}
                disabled={!adminNotes.trim()}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onHandle(request, 'reject', adminNotes)}
                disabled={!adminNotes.trim()}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
