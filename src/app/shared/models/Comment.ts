export interface Comment {
    id: string;
    username: string;
    date: number;
    rating: number;
    comment: string;
    filmId: string;
    userId: string;
    moderatorId?: string;
}