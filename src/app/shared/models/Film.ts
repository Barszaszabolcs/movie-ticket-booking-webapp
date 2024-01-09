export interface Film {
    id: string;
    title: string;
    movie_length: number;
    summary: string;
    age_limit: number;
    cover_url: string;
    genres: string[];
    director: string;
    actors: string;
    creation_date: Date;
    ratings: number[];
}