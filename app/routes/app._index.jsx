// app/routes/_index.jsx
import { Form, useActionData, useNavigation } from "@remix-run/react";
import React, { useState, useEffect } from "react";
import { PrismaClient } from '@prisma/client';
import {
  Check,
  Key,
  Database,
  Settings,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Play,
} from "lucide-react";
import { authenticate } from "../shopify.server";

const prisma = new PrismaClient();

export async function action({ request }) {
  try {
    const formData = await request.formData();
    const actionType = formData.get("actionType");
    const apiKey = formData.get("apiKey");

    const { session } = await authenticate.admin(request);
    const shopDomain = session.shop;

    if (actionType === "saveApiKey") {
      if (!apiKey || apiKey.trim() === "") {
        return Response.json({ error: "API key is required" }, { status: 400 });
      }

      try {
        await prisma.$connect();

        const existingApiKey = await prisma.aPIKeys.findFirst({
          where: { shop_domain: shopDomain }
        });

        if (existingApiKey) {
          await prisma.aPIKeys.update({
            where: { id: existingApiKey.id },
            data: {
              api_key: apiKey,
              savedAt: new Date()
            }
          });
        } else {
          await prisma.aPIKeys.create({
            data: {
              shop_domain: shopDomain,
              api_key: apiKey,
              savedAt: new Date()
            }
          });
        }

        return Response.json({
          success: true,
          message: "API key saved successfully! You can now proceed to sync your products.",
          actionType: "saveApiKey"
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
        return Response.json({ error: "Database operation failed. Please try again." }, { status: 500 });
      }
    }

    if (actionType === "enableTheme") {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return Response.json({
        success: true,
        message: "Ready to integrate! Watch the demo to see how to add search to your theme.",
        actionType: "enableTheme"
      });
    }

    return Response.json({ error: "Invalid action type" }, { status: 400 });
  } catch (error) {
    console.error("Error in action:", error);
    return Response.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}

export default function AdminPanel() {
  const [currentStep, setCurrentStep] = useState(1);
  const [apiKey, setApiKey] = useState("");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const steps = [
    {
      id: 1,
      title: "Login/Signup in Tensor Solution",
      description: "Get started by creating your account on our platform",
      icon: <ExternalLink style={{ width: "20px", height: "20px" }} />,
      action: "Login/Signup",
      url: "https://search.tensorsolution.in/",
    },
    {
      id: 2,
      title: "Enter your API key",
      description: "Secure your connection with your unique API key from the dashboard",
      icon: <Key style={{ width: "20px", height: "20px" }} />,
      action: "Save API Key",
    },
    {
      id: 3,
      title: "Sync your products",
      description: "Synchronize your Shopify products with Tensor Search",
      icon: <Database style={{ width: "20px", height: "20px" }} />,
      action: "Sync Products",
    },
    {
      id: 4,
      title: "Watch Demo - Add Search to Theme",
      description: "Learn how to integrate search functionality into your store theme",
      icon: <Play style={{ width: "20px", height: "20px" }} />,
      action: "Watch Demo",
      url: "https://www.youtube.com/watch?v=your-demo-video-id",
    },
    {
      id: 5,
      title: "Setup Complete",
      description: "You can now manage searchable attributes and optimize your search",
      icon: <Sparkles style={{ width: "20px", height: "20px" }} />,
      action: "Finish Setup",
    },
  ];

  const handleProductSync = async () => {
    try {
      setShowConfirmModal(false);
      setShowNotification(true);
      setNotificationMessage("Syncing products...");
      setNotificationType("info");

      const response = await fetch("/api/sync", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        window.dispatchEvent(new CustomEvent("syncSuccess", { detail: { success: true } }));
      } else {
        showNotificationMessage(result.message || "Sync failed", "error");
      }
    } catch (err) {
      console.error("Sync error:", err);
      showNotificationMessage("Sync failed due to network or server error", "error");
    }
  };

  const ConfirmModal = ({ onConfirm, onCancel }) => (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1001,
    }}>
      <div style={{
        background: "white",
        padding: "24px",
        borderRadius: "12px",
        maxWidth: "480px",
        width: "100%",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
      }}>
        <h3 style={{ fontSize: "20px", marginBottom: "12px", color: "#1e293b" }}>
          Confirm Product Sync
        </h3>
        <p style={{ fontSize: "16px", marginBottom: "20px", color: "#475569" }}>
          Are you sure you want to sync your products with Tensor Solution? This will share your product data with our servers to make them searchable.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button onClick={onCancel} style={{
            padding: "8px 16px",
            background: "#e2e8f0",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            color: "#1e293b",
            fontWeight: "500",
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            padding: "8px 16px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            border: "none",
            borderRadius: "8px",
            color: "white",
            fontWeight: "500",
            cursor: "pointer",
          }}>
            Yes, Sync Now
          </button>
        </div>
      </div>
    </div>
  );

  // Handle action responses
  useEffect(() => {
    if (actionData?.success) {
      const stepMap = {
        'saveApiKey': 2,
        'enableTheme': 4
      };
      
      const completedStep = stepMap[actionData.actionType];
      if (completedStep) {
        setCompletedSteps(prev => {
          const newCompleted = [...prev];
          if (!newCompleted.includes(completedStep)) {
            newCompleted.push(completedStep);
          }
          return newCompleted;
        });
        
        if (completedStep < 5) {
          setCurrentStep(completedStep + 1);
        }
      }
      
      showNotificationMessage(actionData.message, "success");
    } else if (actionData?.error) {
      showNotificationMessage(actionData.error, "error");
    }
  }, [actionData]);

  // Handle sync success from /api/sync
  useEffect(() => {
    const handleSyncSuccess = (event) => {
      if (event.detail?.success) {
        setCompletedSteps(prev => {
          const newCompleted = [...prev];
          if (!newCompleted.includes(3)) {
            newCompleted.push(3);
          }
          return newCompleted;
        });
        setCurrentStep(4);
        showNotificationMessage("Products synced successfully! Your products are now searchable.", "success");
      }
    };

    window.addEventListener('syncSuccess', handleSyncSuccess);
    return () => window.removeEventListener('syncSuccess', handleSyncSuccess);
  }, []);

  const showNotificationMessage = (message, type) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const handleStepAction = (stepId) => {
    if (stepId === 1) {
      window.open("https://search.tensorsolution.in/", "_blank");
      setCompletedSteps(prev => [...prev, 1]);
      setCurrentStep(2);
      showNotificationMessage("Please get your API key from the dashboard and return here to continue.", "info");
      return;
    }

    if (stepId === 4) {
      // Open demo video
      window.open("https://www.youtube.com/watch?v=your-demo-video-id", "_blank"); // Replace with your actual demo video URL
      setCompletedSteps(prev => [...prev, 4]);
      setCurrentStep(5);
      showNotificationMessage("Demo opened! Follow the video to integrate search into your theme.", "info");
      return;
    }

    if (stepId === 5) {
      // Final step - just mark as completed
      setCompletedSteps(prev => [...prev, 5]);
      showNotificationMessage("Setup completed! Your Tensor Search is now ready to use.", "success");
      return;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepCompleted = (stepId) => completedSteps.includes(stepId);
  const isStepActive = (stepId) => stepId === currentStep;

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)",
      padding: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, -apple-system, sans-serif",
      position: "relative",
    },
    notification: {
      position: "fixed",
      top: "24px",
      right: "24px",
      maxWidth: "400px",
      padding: "16px",
      borderRadius: "12px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      zIndex: 1000,
      animation: "slideIn 0.3s ease-out",
    },
    notificationSuccess: {
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "white",
    },
    notificationError: {
      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      color: "white",
    },
    notificationInfo: {
      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      color: "white",
    },
    closeButton: {
      background: "none",
      border: "none",
      color: "inherit",
      cursor: "pointer",
      padding: "4px",
      borderRadius: "4px",
      marginLeft: "auto",
    },
    wrapper: {
      maxWidth: "1024px",
      width: "100%",
    },
    header: {
      textAlign: "center",
      marginBottom: "48px",
    },
    headerIcon: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "64px",
      height: "64px",
      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      borderRadius: "50%",
      marginBottom: "16px",
      boxShadow: "0 10px 25px rgba(99, 102, 241, 0.3)",
    },
    title: {
      fontSize: "36px",
      fontWeight: "bold",
      color: "#1e293b",
      marginBottom: "8px",
      margin: 0,
    },
    subtitle: {
      color: "#64748b",
      fontSize: "18px",
      margin: "20px 0 0 0",
    },
    progressContainer: {
      marginBottom: "48px",
    },
    progressBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    progressStep: {
      display: "flex",
      alignItems: "center",
    },
    progressCircle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      border: "2px solid",
      transition: "all 0.3s ease",
      fontSize: "14px",
      fontWeight: "600",
    },
    progressCircleCompleted: {
      backgroundColor: "#10b981",
      borderColor: "#10b981",
      color: "white",
    },
    progressCircleActive: {
      backgroundColor: "#6366f1",
      borderColor: "#6366f1",
      color: "white",
      animation: "pulse 2s infinite",
    },
    progressCircleInactive: {
      borderColor: "#cbd5e1",
      color: "#64748b",
      backgroundColor: "white",
    },
    progressLine: {
      width: "64px",
      height: "4px",
      marginLeft: "8px",
      marginRight: "8px",
      borderRadius: "2px",
      transition: "all 0.3s ease",
    },
    progressLineCompleted: {
      backgroundColor: "#10b981",
    },
    progressLineInactive: {
      backgroundColor: "#e2e8f0",
    },
    stepsContainer: {
      marginBottom: "32px",
    },
    stepCard: {
      background: "white",
      borderRadius: "16px",
      padding: "24px",
      border: "1px solid",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
      marginBottom: "16px",
    },
    stepCardActive: {
      borderColor: "#6366f1",
      boxShadow: "0 10px 25px rgba(99, 102, 241, 0.15)",
      transform: "translateY(-2px)",
    },
    stepCardCompleted: {
      borderColor: "#10b981",
      backgroundColor: "#f0fdf4",
    },
    stepCardInactive: {
      borderColor: "#e2e8f0",
      opacity: 0.7,
    },
    stepContent: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    stepLeft: {
      display: "flex",
      alignItems: "flex-start",
      gap: "16px",
      flex: 1,
    },
    stepIcon: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      transition: "all 0.3s ease",
    },
    stepIconCompleted: {
      backgroundColor: "#dcfce7",
      color: "#16a34a",
    },
    stepIconActive: {
      backgroundColor: "#e0e7ff",
      color: "#6366f1",
    },
    stepIconInactive: {
      backgroundColor: "#f1f5f9",
      color: "#64748b",
    },
    stepDetails: {
      flex: 1,
    },
    stepTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#1e293b",
      marginBottom: "8px",
      margin: "0 0 8px 0",
    },
    stepDescription: {
      color: "#64748b",
      marginBottom: "16px",
      margin: "0 0 16px 0",
    },
    apiKeyInput: {
      width: "100%",
      padding: "12px 16px",
      background: "white",
      border: "2px solid #e2e8f0",
      borderRadius: "8px",
      color: "#1e293b",
      fontSize: "16px",
      outline: "none",
      transition: "all 0.2s ease",
      marginBottom: "16px",
    },
    completionBox: {
      background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
      borderRadius: "12px",
      padding: "20px",
      border: "2px solid rgba(99, 102, 241, 0.2)",
      textAlign: "center",
    },
    completionTitle: {
      color: "#6366f1",
      fontWeight: "600",
      marginBottom: "8px",
      margin: "0 0 8px 0",
      fontSize: "18px",
    },
    completionText: {
      color: "#64748b",
      fontSize: "14px",
      margin: 0,
    },
    button: {
      padding: "12px 24px",
      borderRadius: "8px",
      fontWeight: "600",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.2s ease",
      fontSize: "16px",
      outline: "none",
      justifyContent: "center",
    },
    buttonPrimary: {
      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      color: "white",
      boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)",
    },
    buttonSuccess: {
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "white",
      boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
    },
    buttonSecondary: {
      background: "white",
      color: "#64748b",
      border: "2px solid #e2e8f0",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    completedStatus: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#16a34a",
      background: "#dcfce7",
      padding: "8px 16px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
    },
    spinner: {
      width: "20px",
      height: "20px",
      border: "2px solid transparent",
      borderTop: "2px solid currentColor",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    navigationButtons: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      marginTop: "24px",
    },
    footer: {
      marginTop: "48px",
      textAlign: "center",
    },
    footerText: {
      color: "#64748b",
      margin: 0,
    },
    footerLink: {
      color: "#6366f1",
      textDecoration: "none",
      transition: "color 0.2s ease",
    },
  };

  const currentStepData = steps.find((step) => step.id === currentStep);

  return (
    <div style={styles.container}>
      {showConfirmModal && (
        <ConfirmModal
          onConfirm={handleProductSync}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }

          .step-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(99, 102, 241, 0.15);
          }

          .button-hover:hover:not(:disabled) {
            transform: scale(1.05);
          }

          .api-input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }

          .footer-link:hover {
            color: #4f46e5;
          }

          @media (max-width: 768px) {
            body {
              font-size: 14px;
            }

            .step-card {
              padding: 16px !important;
            }

            .step-content {
              flex-direction: column !important;
            }

            .step-left {
              flex-direction: column !important;
              align-items: flex-start !important;
            }

            .progress-bar {
              flex-wrap: wrap;
              gap: 8px;
            }

            .navigation-buttons {
              flex-direction: column !important;
              gap: 12px !important;
            }

            .step-icon {
              width: 40px !important;
              height: 40px !important;
            }

            .api-input {
              font-size: 14px !important;
            }

            .button {
              font-size: 14px !important;
              width: 100% !important;
            }

            .notification {
              right: 12px !important;
              left: 12px !important;
              max-width: 100% !important;
              flex-wrap: wrap;
            }

            .footer {
              font-size: 14px;
            }

            .header {
              margin-bottom: 24px !important;
            }

            .header h1 {
              font-size: 24px !important;
            }

            .header p {
              font-size: 14px !important;
            }
          }

          @media (max-width: 768px) {
            .progress-scroll-container {
              overflow-x: auto;
              overflow-y: hidden;
              white-space: nowrap;
              padding-bottom: 12px;
              margin-bottom: 16px;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: thin;
            }

            .progress-scroll-container::-webkit-scrollbar {
              height: 6px;
            }

            .progress-scroll-container::-webkit-scrollbar-thumb {
              background-color: #cbd5e1;
              border-radius: 4px;
            }

            .progress-step {
              display: inline-flex !important;
              flex-shrink: 0 !important;
              margin-right: 12px;
            }

            .progress-line {
              display: none;
            }
          }
        `}


      </style>


      {/* Notification */}
      {showNotification && (
        <div
          style={{
            ...styles.notification,
            ...(notificationType === "success" ? styles.notificationSuccess : 
                notificationType === "error" ? styles.notificationError : styles.notificationInfo),
          }}
          className="notification"
        >
          {notificationType === "success" && <CheckCircle style={{ width: "20px", height: "20px", flexShrink: 0 }} />}
          {notificationType === "error" && <AlertCircle style={{ width: "20px", height: "20px", flexShrink: 0 }} />}
          {notificationType === "info" && <AlertCircle style={{ width: "20px", height: "20px", flexShrink: 0 }} />}
          <span style={{ flex: 1 }}>{notificationMessage}</span>
          <button
            onClick={() => setShowNotification(false)}
            style={styles.closeButton}
          >
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
      )}

      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <Sparkles style={{ width: "32px", height: "32px", color: "white" }} />
          </div>
          <h1 style={styles.title}>Tensor Search Setup</h1>
          <p style={styles.subtitle}>
            Configure your intelligent search solution in 5 simple steps
          </p>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressContainer}>
          <div className="progress-scroll-container" style={styles.progressBar}>
            {steps.map((step, index) => (
              <div key={step.id} style={styles.progressStep} className="progress-step">
                <div
                  style={{
                    ...styles.progressCircle,
                    ...(isStepCompleted(step.id)
                      ? styles.progressCircleCompleted
                      : isStepActive(step.id)
                        ? styles.progressCircleActive
                        : styles.progressCircleInactive),
                  }}
                >
                  {isStepCompleted(step.id) ? (
                    <Check style={{ width: "20px", height: "20px" }} />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    style={{
                      ...styles.progressLine,
                      ...(isStepCompleted(step.id)
                        ? styles.progressLineCompleted
                        : styles.progressLineInactive),
                    }}
                    className="progress-line"
                  />
                )}
              </div>
            ))}
          </div>
        </div>


        {/* Current Step Display */}
        <div style={styles.stepsContainer}>
          <div
            className="step-card"
            style={{
              ...styles.stepCard,
              ...styles.stepCardActive,
            }}
          >
            <div style={styles.stepContent} className="step-content">
              <div style={styles.stepLeft} className="step-left">
                <div
                  style={{
                    ...styles.stepIcon,
                    ...(isStepCompleted(currentStep)
                      ? styles.stepIconCompleted
                      : styles.stepIconActive),
                  }}
                  className="step-icon"
                >
                  {currentStepData.icon}
                </div>
                <div style={styles.stepDetails}>
                  <h3 style={styles.stepTitle}>{currentStepData.title}</h3>
                  <p style={styles.stepDescription}>
                    {currentStepData.description}
                  </p>

                  {/* Step 2: API Key Input */}
                  {currentStep === 2 && (
                    <Form method="post">
                      <input type="hidden" name="actionType" value="saveApiKey" />
                      <input
                        type="text"
                        name="apiKey"
                        placeholder="Enter your API key from Tensor Solution dashboard..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="api-input"
                        style={styles.apiKeyInput}
                        required
                        
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting || !apiKey.trim()}
                        className="button-hover"
                        style={{
                          ...styles.button,
                          ...styles.buttonPrimary,
                          ...(isSubmitting || !apiKey.trim() ? styles.buttonDisabled : {}),
                        }}
                      >
                        {isSubmitting ? (
                          <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" />
                        ) : (
                          <>
                            <Key style={{ width: "16px", height: "16px" }} />
                            <span>Save API Key</span>
                          </>
                        )}
                      </button>
                    </Form>
                  )}

                  {/* Step 3: Sync Products */}
                  {currentStep === 3 && (
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      disabled={isSubmitting}
                      className="button-hover"
                      style={{
                        ...styles.button,
                        ...styles.buttonPrimary,
                        ...(isSubmitting ? styles.buttonDisabled : {}),
                      }}
                    >
                      {isSubmitting ? (
                        <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" />
                      ) : (
                        <>
                          <Database style={{ width: "16px", height: "16px" }} />
                          <span>🔄 Sync Products</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Step 4: Watch Demo */}
                  {currentStep === 4 && (
                    <button
                      onClick={() => handleStepAction(4)}
                      className="button-hover"
                      style={{
                        ...styles.button,
                        ...styles.buttonPrimary,
                      }}
                    >
                      <Play style={{ width: "16px", height: "16px" }} />
                      <span>Watch Demo Video</span>
                    </button>
                  )}

                  {/* Step 5: Completion */}
                  {currentStep === 5 && (
                    <div style={styles.completionBox}>
                      <h4 style={styles.completionTitle}>🎉 Setup Complete!</h4>
                      <p style={styles.completionText}>
                        Your Tensor Search is now fully configured and ready to use. 
                        You can manage searchable attributes and optimize your search experience 
                        from the Tensor Solution dashboard.
                      </p>
                      <button
                        onClick={() => handleStepAction(5)}
                        className="button-hover"
                        style={{
                          ...styles.button,
                          ...styles.buttonSuccess,
                          marginTop: "16px",
                        }}
                      >
                        <Sparkles style={{ width: "16px", height: "16px" }} />
                        <span>Complete Setup</span>
                      </button>
                    </div>
                  )}

                  {/* Step 1: External Link */}
                  {currentStep === 1 && (
                    <button
                      onClick={() => handleStepAction(1)}
                      className="button-hover"
                      style={{
                        ...styles.button,
                        ...styles.buttonPrimary,
                      }}
                    >
                      <ExternalLink style={{ width: "16px", height: "16px" }} />
                      <span>Open Tensor Solution</span>
                    </button>
                  )}
                </div>
              </div>

              {isStepCompleted(currentStep) && (
                <div style={styles.completedStatus}>
                  <Check style={{ width: "16px", height: "16px" }} />
                  <span>Completed</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={styles.navigationButtons} className="navigation-buttons">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="button-hover"
            style={{
              ...styles.button,
              ...styles.buttonSecondary,
              ...(currentStep === 1 ? styles.buttonDisabled : {}),
            }}
          >
            <ArrowLeft style={{ width: "16px", height: "16px" }} />
            <span>Previous</span>
          </button>

          <div style={{ fontSize: "16px", fontWeight: "600", color: "#64748b" }}>
            Step {currentStep} of {steps.length}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === 5 || !isStepCompleted(currentStep)}
            className="button-hover"
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              ...(currentStep === 5 || !isStepCompleted(currentStep) ? styles.buttonDisabled : {}),
            }}
          >
            <span>Next</span>
            <ArrowRight style={{ width: "16px", height: "16px" }} />
          </button>
        </div>

        {/* Footer */}
        <div style={styles.footer} className="footer">
          <p style={styles.footerText}>
            Need help? Check out our{" "}
            <a href="#" style={styles.footerLink} className="footer-link">
              documentation
            </a>{" "}
            or{" "}
            <a href="#" style={styles.footerLink} className="footer-link">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}