client_id := 35p4cbfn4e5rnafr74l1udhubi

# make username=mscott password=Password1! email=mscott@dispostable.com create_user
create_user:
	aws cognito-idp sign-up --client-id $(client_id) --username $(username) --password $(password) --user-attributes Name="email",Value="$(email)" Name="name",Value="$(name)"

# make username=mscott confirm=174345 confirm_user
confirm_user:
	aws cognito-idp confirm-sign-up --client-id $(client_id) --username $(username) --confirmation-code $(confirm)

# make username=mscott password=Password1! login
login:
	aws cognito-idp initiate-auth --client-id $(client_id) --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=$(username),PASSWORD=$(password)
