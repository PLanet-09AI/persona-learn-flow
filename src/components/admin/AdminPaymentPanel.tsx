import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefundManager } from "@/components/payment/RefundManager";
import { 
  CreditCard, 
  Settings, 
  Search, 
  Users, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { enhancedYocoService } from "@/services/yocoEnhanced";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "@/config/firebase";

interface PaymentRecord {
  id: string;
  userId: string;
  userEmail?: string;
  amount: number;
  status: string;
  createdAt: string;
  subscriptionType?: string;
  paymentMethod?: string;
}

export const AdminPaymentPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState("");

  const configInfo = enhancedYocoService.getConfigInfo();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      // Load payment records from Firebase
      const paymentsRef = collection(db, 'payments');
      const paymentsQuery = query(
        paymentsRef,
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(paymentsQuery);
      const paymentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PaymentRecord[];

      setPayments(paymentData);
    } catch (error) {
      console.error('Failed to load payments:', error);
      // Load demo data if Firebase fails
      loadDemoPayments();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoPayments = () => {
    const demoPayments: PaymentRecord[] = [
      {
        id: 'ch_demo_1',
        userId: 'user_1',
        userEmail: 'john@example.com',
        amount: 9900, // R99.00
        status: 'successful',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        subscriptionType: 'Monthly Pro',
        paymentMethod: 'card'
      },
      {
        id: 'ch_demo_2',
        userId: 'user_2',
        userEmail: 'jane@example.com',
        amount: 29900, // R299.00
        status: 'successful',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        subscriptionType: 'Annual Pro',
        paymentMethod: 'card'
      },
      {
        id: 'ch_demo_3',
        userId: 'user_3',
        userEmail: 'bob@example.com',
        amount: 4900, // R49.00
        status: 'failed',
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        subscriptionType: 'Monthly Basic',
        paymentMethod: 'card'
      },
      {
        id: 'ch_demo_4',
        userId: 'user_4',
        userEmail: 'alice@example.com',
        amount: 9900, // R99.00
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        subscriptionType: 'Monthly Pro',
        paymentMethod: 'card'
      }
    ];
    setPayments(demoPayments);
  };

  const filteredPayments = payments.filter(payment => 
    payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.subscriptionType?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'successful':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'successful':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const calculateStats = () => {
    const total = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const successful = filteredPayments.filter(p => p.status === 'successful').length;
    const failed = filteredPayments.filter(p => p.status === 'failed').length;
    const pending = filteredPayments.filter(p => p.status === 'pending').length;

    return {
      totalRevenue: total / 100,
      totalPayments: filteredPayments.length,
      successfulPayments: successful,
      failedPayments: failed,
      pendingPayments: pending,
      successRate: filteredPayments.length > 0 ? (successful / filteredPayments.length) * 100 : 0
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Administration</h1>
          <p className="text-muted-foreground">Manage payments and process refunds</p>
        </div>
        <Button onClick={loadPayments} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Configuration Alert */}
      <Alert className={configInfo.hasSecretKey ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
        <Settings className={`h-4 w-4 ${configInfo.hasSecretKey ? 'text-green-600' : 'text-yellow-600'}`} />
        <AlertDescription>
          <strong>API Configuration:</strong>{' '}
          {configInfo.hasSecretKey ? (
            <span className="text-green-700">
              Production ready ✓ ({configInfo.secretKeyPreview})
            </span>
          ) : (
            <span className="text-yellow-700">
              Development mode - Add VITE_YOCO_SECRET_KEY for live operations
            </span>
          )}
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="refunds">Process Refunds</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R{stats.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">From {stats.totalPayments} payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">{stats.successfulPayments} successful</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.failedPayments}</div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                <p className="text-xs text-muted-foreground">Processing</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="font-medium">{payment.userEmail || 'Unknown User'}</p>
                        <p className="text-sm text-muted-foreground">{payment.subscriptionType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R{(payment.amount / 100).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {filteredPayments.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No payments found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments by ID, email, or subscription type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                All Payments ({filteredPayments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(payment.status)}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm">{payment.id}</p>
                            <Badge variant={getStatusVariant(payment.status)}>
                              {payment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {payment.userEmail} • {payment.subscriptionType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">R{(payment.amount / 100).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPaymentId(payment.id);
                            setActiveTab("refunds");
                          }}
                          disabled={payment.status !== 'successful'}
                        >
                          Refund
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No payments found</p>
                    {searchQuery && (
                      <Button variant="link" onClick={() => setSearchQuery("")}>
                        Clear search
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds">
          <RefundManager
            paymentId={selectedPaymentId}
            onRefundComplete={(refundData) => {
              console.log('Refund completed:', refundData);
              setSelectedPaymentId("");
              loadPayments(); // Reload to reflect changes
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPaymentPanel;
