client_id := <client-id>

create_user:
	aws cognito-idp sign-up --client-id $(client_id) --username $(username) --password $(password) --user-attributes Name="email",Value="$(email)" Name="name",Value="$(name)"

confirm_user:
	aws cognito-idp confirm-sign-up --client-id $(client_id) --username $(username) --confirmation-code $(confirm)

login:
	aws cognito-idp initiate-auth --client-id $(client_id) --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=$(username),PASSWORD=$(password)
