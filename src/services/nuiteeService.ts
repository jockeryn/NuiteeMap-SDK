
export default class Nuitee {

    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async fetchHotels({latitude, longitude, radius, checkin='2024-12-30', checkout='2024-12-31', adults=2, children=0}: {latitude: number, longitude: number, radius: number, checkin?: string, checkout?: string, adults?: number, children?: number}): Promise<any> {
        const url = 'https://api.liteapi.travel/v3.0/data/hotels';

        const requestParams = {
            latitude,
            longitude,
            radius,
            checkin,
            checkout,
            currency: 'USD',
            guestNationality: 'US',
            occupancies: [{ adults, children}],
            limit: 10,
        };

        try {
            const response = await fetch(`${url}?latitude=${latitude}&longitude=${longitude}&radius=${radius}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey,
                }
            });

            if (!response.ok) throw new Error(`Error: ${response.statusText}`);
            
            const data = await response.json();
            console.log('Hotels:', data);
            return data;
        } catch (error) {
            console.error('Error fetching hotels:', error);
        }
    }
}

