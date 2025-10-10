import { Client, Account } from 'appwrite';

const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '68de6ea10017532e1685';

console.log('Appwrite Config:', { 
  endpoint, 
  projectId, 
  origin: window.location.origin,
  mode: import.meta.env.MODE 
});

client
  .setEndpoint(endpoint)
  .setProject(projectId);

// Test connection in production
if (import.meta.env.PROD) {
  client.health.get()
    .then(() => console.log('✅ Appwrite connection successful'))
    .catch(error => console.error('❌ Appwrite connection failed:', error));
}

export const account = new Account(client);
export { client };
