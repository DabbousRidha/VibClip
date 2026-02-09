
export interface Brand {
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
        muted: string;
    };
    typography: {
        heading: string;
        body: string;
    };
    style: {
        radius: number;
        border: number;
        shadow: string;
    };
    assets?: {
        logo?: string;
        watermark?: string;
        intro?: string;
        outro?: string;
    };
}

export const BrandPresets: Record<string, Brand> = {
    TechStart: {
        name: 'TechStart',
        colors: {
            primary: '#3498db',
            secondary: '#2ecc71',
            accent: '#e74c3c',
            background: '#0f172a',
            text: '#f8fafc',
            muted: '#64748b'
        },
        typography: {
            heading: 'bold Inter, sans-serif',
            body: 'Inter, sans-serif'
        },
        style: {
            radius: 8,
            border: 1,
            shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }
    },
    FashionHouse: {
        name: 'FashionHouse',
        colors: {
            primary: '#000000',
            secondary: '#ffffff',
            accent: '#d4af37', // Gold
            background: '#ffffff',
            text: '#1a1a1a',
            muted: '#a3a3a3'
        },
        typography: {
            heading: 'Playfair Display, serif',
            body: 'Lato, sans-serif'
        },
        style: {
            radius: 0,
            border: 0,
            shadow: 'none'
        }
    },
    CorporatePro: {
        name: 'CorporatePro',
        colors: {
            primary: '#1e3a8a', // Dark Blue
            secondary: '#64748b', // Slate
            accent: '#0ea5e9', // Sky
            background: '#f8fafc',
            text: '#0f172a',
            muted: '#94a3b8'
        },
        typography: {
            heading: 'bold Roboto, sans-serif',
            body: 'Roboto, sans-serif'
        },
        style: {
            radius: 4,
            border: 1,
            shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }
    }
};

export const DefaultBrand = BrandPresets.TechStart;
