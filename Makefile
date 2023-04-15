client_id := 3d2n2rjudunjaqv3vnb7or4t8u

# make username=mscott password=Password1! email=mscott@dispostable.com create_user
create_user:
	aws cognito-idp sign-up --client-id $(client_id) --username $(username) --password $(password) --user-attributes Name="email",Value="$(email)" Name="name",Value="$(name)"

# make username=mscott confirm=470651 confirm_user
confirm_user:
	aws cognito-idp confirm-sign-up --client-id $(client_id) --username $(username) --confirmation-code $(confirm)

# login through hosted ui to get token:
# https://williamalanmallett.auth.us-east-1.amazoncognito.com/oauth2/authorize?client_id=3d2n2rjudunjaqv3vnb7or4t8u&response_type=token&scope=openid&redirect_uri=https%3A%2F%2Fwilliamalanmallett.link

# The client (front-end app) should decrypt the id_token and use it in the application. Can also send the sub to the backend.
	#: https://repost.aws/knowledge-center/decode-verify-cognito-json-token