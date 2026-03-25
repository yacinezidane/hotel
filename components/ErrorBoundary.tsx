import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorDetails = this.state.error?.toString();
      let firestoreInfo = null;

      if (errorDetails?.includes('{"error":')) {
        try {
          // Extract JSON from the error message if it's a Firestore error
          const jsonMatch = errorDetails.match(/\{.*\}/);
          if (jsonMatch) {
            firestoreInfo = JSON.parse(jsonMatch[0]);
            errorDetails = firestoreInfo.error;
          }
        } catch (e) {
          console.error("Failed to parse Firestore error info", e);
        }
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4" dir="rtl">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md md:max-w-2xl w-full border-4 border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
              <AlertTriangle size={40} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">حدث خطأ غير متوقع</h1>
            <p className="text-gray-500 mb-6 font-medium">نعتذر عن هذا الخلل. يرجى محاولة تحديث الصفحة.</p>
            
            <div className="bg-gray-100 p-4 rounded-xl text-left mb-6 overflow-auto max-h-64 text-xs font-mono text-red-800" dir="ltr">
              <div className="font-bold mb-2">{errorDetails}</div>
              {firestoreInfo && (
                <div className="mt-4 pt-4 border-t border-red-200 space-y-1">
                  <div className="text-gray-600 uppercase text-[10px] font-bold">Firestore Debug Info:</div>
                  <div>Operation: <span className="font-bold">{firestoreInfo.operationType}</span></div>
                  <div>Path: <span className="font-bold">{firestoreInfo.path}</span></div>
                  <div>User ID: <span className="font-bold">{firestoreInfo.authInfo?.userId || 'Not Logged In'}</span></div>
                  <div>Email: <span className="font-bold">{firestoreInfo.authInfo?.email || 'N/A'}</span></div>
                </div>
              )}
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <RefreshCw size={20} /> تحديث النظام
            </button>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}
