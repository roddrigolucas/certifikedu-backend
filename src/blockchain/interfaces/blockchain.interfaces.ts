export interface ICertificateLedger {
  createdAt: Date;
  userId: string;
  certificateId: string;
  certificateCreationDate: Date;
  receptorDoc: string;
  receptorName: string;
  certificateName: string;
  certificateDescription: string;
  certificateHoursWorkload: number;
  associatedAbilities: string[];
  emissorDoc: string;
  emissorName: string;
}
