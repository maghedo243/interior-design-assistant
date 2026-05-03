export interface LocalizedText {
    source_lang: string;
    translated: boolean;
    value: string;
}

export interface LocalizedList {
    source_lang: string;
    translated: boolean;
    value: Array<string>;
}

export interface Product {
    _id: string;
    name: LocalizedText;
    image: string;
    description: LocalizedText | null;
    style: LocalizedText| null;
}

export interface triggerZone {
    x: number; 
    y: number; 
    width: number; 
    height: number;
    onTrigger?: () => void;
    onHover?: () => void;
}