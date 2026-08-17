import { useEffect, useState } from "react";
import {
  getNetworkStateAsync,
  addNetworkStateListener,
} from "expo-network";

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    getNetworkStateAsync().then((state) => {
      setIsConnected(state.isConnected ?? true);
    });
    const sub = addNetworkStateListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => sub.remove();
  }, []);

  return isConnected;
}
