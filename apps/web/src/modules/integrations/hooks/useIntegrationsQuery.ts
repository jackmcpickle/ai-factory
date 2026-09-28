import { useIntegrationsContext } from "@/modules/integrations/hooks/useIntegrations";
import type { IntegrationConnection } from "@/modules/integrations/types";

interface UseIntegrationsQueryReturn {
  connections: IntegrationConnection[];
  error: string | null;
  isIntegrationsLoading: boolean;
  isIntegrationsError: boolean;
}

export function useIntegrationsQuery(): UseIntegrationsQueryReturn {
  const { model } = useIntegrationsContext();
  return {
    connections: model.connections,
    error: model.error,
    isIntegrationsLoading: false,
    isIntegrationsError: model.type === "Invalid",
  };
}
