export type TRankedPlayer = {
  user: {
    id: string;
    pessoaFisica: {
      nome: string;
    };
    document: {
      s3Url: string;
    }[];
  };
} & {
  id: string;
  userId: string;
  updateAt: Date;
  currentXP: number;
  currentLevel: number;
  currentTitle: string;
}