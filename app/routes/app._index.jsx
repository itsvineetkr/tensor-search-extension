// app/routes/_index.jsx
import { Form } from "@remix-run/react";
import React, { useState } from "react";
import {
  Check,
  Key,
  Database,
  Settings,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
export default function AdminPanel() {
  const [currentStep, setCurrentStep] = useState(1);
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = [
    {
      id: 1,
      title: "Login/Signup in Tensor solution",
      description: "Get started by creating your account",
      icon: <ExternalLink style={{ width: "20px", height: "20px" }} />,
      action: "Login/Signup",
      url: "https://search.tensorsolution.in/",
    },
    {
      id: 2,
      title: "Enter your API key present in the dashboard",
      description: "Secure your connection with your unique API key",
      icon: <Key style={{ width: "20px", height: "20px" }} />,
      action: "Save",
    },
    {
      id: 3,
      title: "Proceed to index data",
      description: "Initialize your search index for optimal performance",
      icon: <Database style={{ width: "20px", height: "20px" }} />,
      action: "Index Data",
    },
    {
      id: 4,
      title: "Enable Tensor Search into your theme",
      description: "Integrate search functionality seamlessly",
      icon: <Settings style={{ width: "20px", height: "20px" }} />,
      action: "Enable",
    },
    {
      id: 5,
      title: "Complete Setup",
      description: "You can now manage searchable attributes and data",
      icon: <Sparkles style={{ width: "20px", height: "20px" }} />,
      action: "Finish",
    },
  ];

  const handleStepAction = async (stepId) => {
    if (stepId === 1) {
      window.open("https://search.tensorsolution.in/", "_blank");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setCompletedSteps([...completedSteps, stepId]);
      if (stepId < 5) {
        setCurrentStep(stepId + 1);
      }
      setIsLoading(false);
    }, 1500);
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
      background:
        "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)",
      padding: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, -apple-system, sans-serif",
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
      margin: "20px",
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
      margin: 0,
    },
    stepDescription: {
      color: "#64748b",
      marginBottom: "16px",
      margin: 0,
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
      background:
        "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
      borderRadius: "8px",
      padding: "16px",
      border: "2px solid rgba(99, 102, 241, 0.2)",
    },
    completionTitle: {
      color: "#6366f1",
      fontWeight: "600",
      marginBottom: "4px",
      margin: 0,
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
      borderTop: "2px solid white",
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
          
          .step-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(99, 102, 241, 0.15);
          }
          
          .button-hover:hover {
            transform: scale(1.05);
          }
          
          .api-input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
          
          .footer-link:hover {
            color: #4f46e5;
          }
        `}
      </style>

      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Tensor Search Setup</h1>
          <p style={styles.subtitle}>
            Configure your intelligent search solution in 5 simple steps
          </p>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            {steps.map((step, index) => (
              <div key={step.id} style={styles.progressStep}>
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
            <div style={styles.stepContent}>
              <div style={styles.stepLeft}>
                <div
                  style={{
                    ...styles.stepIcon,
                    ...(isStepCompleted(currentStep)
                      ? styles.stepIconCompleted
                      : styles.stepIconActive),
                  }}
                >
                  {currentStepData.icon}
                </div>
                <div style={styles.stepDetails}>
                  <h3 style={styles.stepTitle}>{currentStepData.title}</h3>
                  <p style={styles.stepDescription}>
                    {currentStepData.description}
                  </p>

                  {currentStep === 2 && (
                    <input
                      type="text"
                      placeholder="Enter your API key..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="api-input"
                      style={styles.apiKeyInput}
                    />
                  )}

                  {currentStep === 5 && (
                    <div style={styles.completionBox}>
                      <p style={styles.completionTitle}>🎉 Setup Complete!</p>
                      <p style={styles.completionText}>
                        You can now manage searchable attributes and data to
                        display in your Tensor Search dashboard.
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => handleStepAction(currentStep)}
                    disabled={
                      isLoading || (currentStep === 2 && !apiKey.trim())
                    }
                    className="button-hover"
                    style={{
                      ...styles.button,
                      ...(currentStep === 5
                        ? styles.buttonSuccess
                        : styles.buttonPrimary),
                      ...(isLoading || (currentStep === 2 && !apiKey.trim())
                        ? styles.buttonDisabled
                        : {}),
                      marginTop: "16px",
                    }}
                  >
                    {isLoading ? (
                      <div style={styles.spinner}></div>
                    ) : (
                      <>
                        <span>{currentStepData.action}</span>
                        <ArrowRight style={{ width: "16px", height: "16px" }} />
                      </>
                    )}
                  </button>
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
        <div style={styles.navigationButtons}>
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

          <div
            style={{ fontSize: "16px", fontWeight: "600", color: "#64748b" }}
          >
            Step {currentStep} of {steps.length}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === 5}
            className="button-hover"
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              ...(currentStep === 5 ? styles.buttonDisabled : {}),
            }}
          >
            <span>Next</span>
            <ArrowRight style={{ width: "16px", height: "16px" }} />
          </button>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
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
