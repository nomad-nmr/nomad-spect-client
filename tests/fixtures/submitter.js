export const bookingData1 =
  '[{"userId":"5fe1d5ac487ca62e726646b1","group":"admins","holder":7,"sampleId":"2303101627-3-7-admin","solvent":"CDCl3","priority":false,"night":false,"title":"booking test ","experiments":[{"expNo":"10","paramSet":"proton.a.and","expTitle":"1H Observe"},{"expNo":"11","paramSet":"c13_deptq.a.and","expTitle":"13C Observe with multiplicity editing - DEPTQ"}]}]'

export const bookingData2 =
  '[{"userId":"5fe1d5ac487ca62e726646b1","group":"admins","holder":7,"sampleId":"2303101643-3-7-admin","solvent":"DMSO","priority":true,"night":true,"title":"night test","experiments":[{"expNo":"10","paramSet":"c13_deptq.a.and","expTitle":"13C Observe with multiplicity editing - DEPTQ","params":"ns,1600"}]}]'

export const bookingString1 =
  'USER admins\n' +
  '\t\n' +
  'HOLDER 7\n' +
  'NAME 2303101627-3-7-admin\n' +
  'SOLVENT CDCl3\n' +
  'NO_SUBMIT\n' +
  '\n' +
  '\n' +
  '\n' +
  'EXPNO 10\n' +
  '\n' +
  'EXPERIMENT proton.a.and\n' +
  'TITLE booking test  || 1H Observe\n' +
  '\n' +
  '\n' +
  '\n' +
  'EXPNO 11\n' +
  '\n' +
  'EXPERIMENT c13_deptq.a.and\n' +
  'TITLE booking test  || 13C Observe with multiplicity editing - DEPTQ\n' +
  '\t\t\n' +
  'END'

export const bookingString2 =
  'USER admins\n' +
  '\t\n' +
  'HOLDER 7\n' +
  'NAME 2303101643-3-7-admin\n' +
  'SOLVENT DMSO\n' +
  'NO_SUBMIT\n' +
  '\n' +
  'NIGHT\n' +
  'PRIORITY\n' +
  'EXPNO 10\n' +
  'PARAMETERS ns,1600\n' +
  'EXPERIMENT c13_deptq.a.and\n' +
  'TITLE night test || 13C Observe with multiplicity editing - DEPTQ\n' +
  '\t\t\n' +
  'END'
