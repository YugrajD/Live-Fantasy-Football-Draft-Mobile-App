const DEV_MODE = true;

// Change this to your computer's local IP when testing on device
// Find your IP: On Mac/Linux run `ifconfig | grep "inet "`, on Windows run `ipconfig`
// Look for your local network IP (usually starts with 192.168.x.x or 10.x.x.x)
const LOCAL_IP = '10.0.0.232'; // <- UPDATE THIS

export const config = {
  API_URL: DEV_MODE 
    ? `http://${LOCAL_IP}:8000/api`
    : 'https://your-production-url.com/api',
  
  WS_URL: DEV_MODE
    ? `ws://${LOCAL_IP}:8000/ws`
    : 'wss://your-production-url.com/ws',
};

