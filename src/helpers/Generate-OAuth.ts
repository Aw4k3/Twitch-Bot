interface IParams {
  client_id: string;
  client_secret: string;
  grant_type: "client_credentials";
}

interface IOAuth {
  accessToken: string;
  expiresIn: number;
  type: "bearer";
}

export default async function generateOAuth(): Promise<IOAuth> {
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: "kzbcmztcozjdk6m6t0aybzr5mjqq85",
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  const data = await res.json();
  // console.log(data);

  return { 
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    type: data.token_type
  };
};
