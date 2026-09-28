import { useMutation } from "@tanstack/react-query";
import type {
  UseMutateAsyncFunction,
  UseMutateFunction,
} from "@tanstack/react-query";

import { useIntegrationsActions } from "@/modules/integrations/hooks/useIntegrations";
import { parseIntegrationDraft } from "@/modules/integrations/schemas/integration.schema";
import type { IntegrationDraft } from "@/modules/integrations/types";
import { integrationKeys } from "@/utils/queryKeys";

interface UseConnectIntegrationMutationReturn {
  connectIntegrationMutationAsync: UseMutateAsyncFunction<
    IntegrationDraft,
    Error,
    IntegrationDraft
  >;
  isConnectPending: boolean;
}

export function useConnectIntegrationMutation(): UseConnectIntegrationMutationReturn {
  const actions = useIntegrationsActions();
  const { mutateAsync, isPending } = useMutation({
    mutationKey: [...integrationKeys.all, "connect"],
    mutationFn: (draft: IntegrationDraft) => {
      const parsed = parseIntegrationDraft(draft);
      if (!parsed.ok) {
        return Promise.reject(new Error(parsed.error));
      }
      actions.connect(parsed.draft);
      return Promise.resolve(parsed.draft);
    },
  });
  return {
    connectIntegrationMutationAsync: mutateAsync,
    isConnectPending: isPending,
  };
}

interface UseDisconnectIntegrationMutationReturn {
  disconnectIntegrationMutation: UseMutateFunction<void, Error, string>;
  isDisconnectPending: boolean;
}

export function useDisconnectIntegrationMutation(): UseDisconnectIntegrationMutationReturn {
  const actions = useIntegrationsActions();
  const { mutate, isPending } = useMutation({
    mutationKey: [...integrationKeys.all, "disconnect"],
    mutationFn: (id: string) => {
      actions.disconnect(id);
      return Promise.resolve();
    },
  });
  return {
    disconnectIntegrationMutation: mutate,
    isDisconnectPending: isPending,
  };
}

interface UseRemoveIntegrationMutationReturn {
  removeIntegrationMutation: UseMutateFunction<void, Error, string>;
  isRemovePending: boolean;
}

export function useRemoveIntegrationMutation(): UseRemoveIntegrationMutationReturn {
  const actions = useIntegrationsActions();
  const { mutate, isPending } = useMutation({
    mutationKey: [...integrationKeys.all, "remove"],
    mutationFn: (id: string) => {
      actions.remove(id);
      return Promise.resolve();
    },
  });
  return { removeIntegrationMutation: mutate, isRemovePending: isPending };
}
