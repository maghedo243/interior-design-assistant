export interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string;
}

export interface triggerZone {
    x: number; 
    y: number; 
    width: number; 
    height: number;
    onTrigger?: () => void;
    onHover?: () => void;
}