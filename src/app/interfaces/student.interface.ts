
export interface Student {
  // Información DB
  uid?:      any;
  role:        string;
  createdOn?:  Date;
  status:      string;

  // Datos personales
  firstName:  string;
  middleName: string;
  lastName:   string;
  age:        string;
  sex:        string;
  email:      string;
  phone:      number;
  maritalStatus: string;

  // Dirección
  address: {
    mainStreet:    string;
    crossings:     string;
    postalCode:    number;
    state:         string;
    neighborhood?: string;
    municipality?: string;
    city?:         string;
  };

  // Matrícula
  idStudent?: any;
  // Idiomas
  languages?: {
    english: {
      written:     string;
      spoken:      string;
      translation: string;
    }
  };

  // Grados académicos
  degree?: {
    bachelor:   string;
    speciality: string;
    master:     string;
    phd:        string;
  };
  resumeURL:     string;
  isGraduated?: boolean;
}
