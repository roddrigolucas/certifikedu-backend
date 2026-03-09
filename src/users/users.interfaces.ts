export interface ICreatePessoaFisica {
  userId: string;
  CPF: string;
  email: string;
  nome: string;
  telefone: string;
  dataDeNascimento: string;
  cepNumber: string;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento?: string;
}
