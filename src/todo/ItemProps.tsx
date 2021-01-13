export interface ItemProps{
    _id?: string;
    name: string;
    quantity: number;
    available: Date;
    withCaffeine: boolean;
    userId: string;
    status:number;
    version:number;
    imgPath:string,
    latitude:number,
    longitude:number
}