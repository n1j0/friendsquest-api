export interface LeaderboardRepositoryInterface {
    getTop100: () => Promise<{}[]>
}
