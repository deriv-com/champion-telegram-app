class HttpService {
  // Mock CRUD methods that return promises with demo data
  async get(endpoint, params = {}) {
    console.log('GET request to:', endpoint, 'with params:', params);
    return Promise.resolve({ success: true, data: {} });
  }

  async post(endpoint, data = {}) {
    console.log('POST request to:', endpoint, 'with data:', data);
    return Promise.resolve({ success: true, data: {} });
  }

  async put(endpoint, data = {}) {
    console.log('PUT request to:', endpoint, 'with data:', data);
    return Promise.resolve({ success: true, data: {} });
  }

  async delete(endpoint) {
    console.log('DELETE request to:', endpoint);
    return Promise.resolve({ success: true });
  }
}

export const httpService = new HttpService();
