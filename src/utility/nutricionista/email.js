import SibApiV3Sdk from 'sib-api-v3-sdk';
//   static async envioDeEmail( p_email) {

//     const defaultClient = SibApiV3Sdk.ApiClient.instance


//     // Configure API key authorization: api-key
//     const apiKey = defaultClient.authentications['api-key']
//     apiKey.apiKey = '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'

//     const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
//     const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()
//     sendSmtpEmail.sender = { name: 'Prueba', email: 'usuario_de_test@proton.me' }
//     sendSmtpEmail.to = [{ email: 'julioneo95@hotmail.com' }];
//     sendSmtpEmail.subject = 'Status de registro.'
//     sendSmtpEmail.htmlContent = '<p>HTML content of the email</p>'
//     sendSmtpEmail.textContent = 'Su registro se ha aprobado, por favor inicie sesión en nuestra plataforma para continuar.'
//     sendSmtpEmail.headers = {
//       'api-key': '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',
//       'content-type': 'application/json',
//       'accept': 'application/json',
//     }

//     apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
//     console.log('API called successfully. Returned data: ' + data)
//   }, function(error) {
//     console.error(error)
//   })
// }