import { useState, useCallback, useRef, useEffect } from "react";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(); //so this undefined means no error

  //to check page is same from where request is sending
  const activeHttpRequests = useRef([]);

  //sendRequest() is for send request and to avoid infinite loops I will wrap it by useCallback so that this function never gets recreated when the component use this hook re-render
  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);
      const httpAbortCtrl = new AbortController();
      activeHttpRequests.current.push(httpAbortCtrl);
      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrl.signal
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message);
        }

        return responseData;
      } catch (err) {
        setError(err.message);
      }
      setIsLoading(false);
    },
    []
  ); //this fun has no dependency there we use blank array for useCallback()

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
      return () => {
          activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abortCtrl);
      }
  }, []);

  return { isLoading, error, sendRequest, clearError };
};
