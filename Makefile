client_id := 55ovc1gcchhcc4s9da8gvt4r9c

# make username=mscott password=Password1! email=mscott@dispostable.com create_user
create_user:
	aws cognito-idp sign-up --client-id $(client_id) --username $(username) --password $(password) --user-attributes Name="email",Value="$(email)" Name="name",Value="$(name)"

# make username=mscott confirm=174345 confirm_user
confirm_user:
	aws cognito-idp confirm-sign-up --client-id $(client_id) --username $(username) --confirmation-code $(confirm)

# make username=mscott password=Password1! login (This doesn't give the correct scopes)
# login through ui instead: https://williamalanmallet.auth.us-east-1.amazoncognito.com/oauth2/authorize?client_id=55ovc1gcchhcc4s9da8gvt4r9c&response_type=code&scope=openid&redirect_uri=https%3A%2F%2Fwilliamalanmallett.link
# login:
# 	aws cognito-idp initiate-auth --client-id $(client_id) --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=$(username),PASSWORD=$(password)
