interface InstagramConfig {
  accessToken: string;
  accountId: string;
  apiVersion: string;
}

export const getInstagramConfig = (): InstagramConfig => {
  const accessToken = import.meta.env.VITE_INSTAGRAM_GRAPH_API_ACCESS_TOKEN;
  const accountId = import.meta.env.VITE_INSTAGRAM_ACCOUNT_ID;
  const apiVersion = import.meta.env.VITE_INSTAGRAM_API_VERSION || 'v22.0';
  
  if (!accessToken || !accountId) {
    throw new Error('Instagram API configuration is incomplete. Please check your environment variables.');
  }
  
  return { accessToken, accountId, apiVersion };
};

export const isInstagramConfigAvailable = (): boolean => {
  const accessToken = import.meta.env.VITE_INSTAGRAM_GRAPH_API_ACCESS_TOKEN;
  const accountId = import.meta.env.VITE_INSTAGRAM_ACCOUNT_ID;
  
  return !!(accessToken && accountId);
};