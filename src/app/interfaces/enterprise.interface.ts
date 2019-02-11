export interface Enterprise {
  // Información DB
  uid?:       any;
  createdOn?: Date;
  status:     string;
  role:       string;

  // Datos contacto
  firstName:    string;
  middleName:   string;
  lastName:     string;
  job:          string;
  department:   string;
  email:        string;
  contactPhone:   number;
  contactAddress: string;

  // Datos empresa
  comercialName:  string;
  bussinessName:  string;
  bussinessPhone: string;
  bussinessTurn:  string;
  description:    string;
  RFC:            string;
  logo:           string;
  webURL?:        string;

  // Dirección
  address: {
    mainStreet:     string;
    crossings:      string;
    postalCode:     number;
    city?:          string;
    municipality?:  string;
    state:          string;
  };

}
