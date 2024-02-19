export interface Ticket {
    id: string;
    type: string;
    price: number;
    payed: boolean;
    chosen_seat: string;
    screeningId: string;
    orderId: string;
    prizeId?: string;
}