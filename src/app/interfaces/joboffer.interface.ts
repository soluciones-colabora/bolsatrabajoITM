export interface Joboffer {
  uid?:          any;
  idEnterprise?: any;
  createdOn?:    Date;
  applicants:    Array<{
    uid: string,
    message: string,
  }>;

  // Posibles datos de la empresa:
  enterpriseName?: string;
  enterpriseLogo?: string;

  // Datos del puesto
  position:     string;
  description:  string;
  economicType?: string;
  economicAmount?: number;
  vacantNumber: number;
  // # de horas a trabajar a la semana
  weeklyHours:     number;
  // location:     string;


  // Perfil deseado
  bachelors:     string[];
  aptitudes:    string[];
  experience:   number;
  languages?: {
    english: {
      written:  string;
      spoken:   string;
      translation: string;
    }
  };
  status?:    string;
}
