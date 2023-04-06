client_id := 63l4t832h74ep03jp0s08sj8dm

# make username=mscott password=Password1! email=mscott@dispostable.com create_user
create_user:
	aws cognito-idp sign-up --client-id $(client_id) --username $(username) --password $(password) --user-attributes Name="email",Value="$(email)" Name="name",Value="$(name)"

# make username=mscott confirm=174345 confirm_user
confirm_user:
	aws cognito-idp confirm-sign-up --client-id $(client_id) --username $(username) --confirmation-code $(confirm)

# login through hosted ui to get token:
# https://williamalanmallett.auth.us-east-1.amazoncognito.com/oauth2/authorize?client_id=63l4t832h74ep03jp0s08sj8dm&response_type=token&scope=openid&redirect_uri=https%3A%2F%2Fwilliamalanmallett.link

