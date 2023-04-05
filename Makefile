client_id := 6joopnb17969k04b91vp8qbrfk

# make username=mscott password=Password1! email=mscott@dispostable.com create_user
create_user:
	aws cognito-idp sign-up --client-id $(client_id) --username $(username) --password $(password) --user-attributes Name="email",Value="$(email)" Name="name",Value="$(name)"

# make username=mscott confirm=174345 confirm_user
confirm_user:
	aws cognito-idp confirm-sign-up --client-id $(client_id) --username $(username) --confirmation-code $(confirm)

# login through hosted ui to get token:
# https://williamalanmallet.auth.us-east-1.amazoncognito.com/oauth2/authorize?client_id=6joopnb17969k04b91vp8qbrfk&response_type=token&scope=openid&redirect_uri=https%3A%2F%2Fwilliamalanmallett.link

