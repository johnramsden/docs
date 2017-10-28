---
title: Sending Specific Traffic Through OpenVPN
sidebar: bsd_sidebar
hide_sidebar: false
category: [ bsd, pfsense ]
keywords: freebsd, bsd, pfsense, vpn
tags: [ freebsd, bsd, pfsense, networking ]
permalink: bsd_pfsense_send_traffic_through_vpn.html
toc: false
folder: bsd/pfsense
---

Using Private Internet Access, follow instructions on [client support](https://www.privateinternetaccess.com/pages/client-support/pfsense).

## Certificate Authority

Download cert from VPN provider.

For PIA it's located at https://www.privateinternetaccess.com/openvpn/ca.rsa.2048.crt

Navigate to System -> Cert Manager -> CAs.

Add a new CA for PIA with above cert in 'Certificate data' field.

## OpenVPN

Navigate to VPN -> OpenVPN -> Clients.

Add client with the following settings.

*   Server host, choose from [available hosts](https://www.privateinternetaccess.com/pages/network/): nl.privateinternetaccess.com
*   Protocol: UDP
*   Server port: 1198
*   Server hostname resolution: Ensure that "Infinitely resolve server" is checked.
*   User Authentication Settings: Fill the Username and Password fields with your PIA username and password.
*   TLS Authentication: Ensure "Enable authentication of TLS packets" is disabled.
*   Peer Certificate Authority: Select the PIA CA we setup.
*   Client Certificate: None (Username and/or Password required)
*   Encryption Algorithm: AES-128-CBC (128-bit).
*   Auth digest algorithm: SHA1 (160-bit).
*   Compression: Enabled with Adaptive Compression.
*   Disable IPv6: Ensure "Don't forward IPv6 traffic" is checked.
*   Custom options: Copy and paste the following into the custom options textbox. 'route-nopull' prevents the VPN client from creating a standard rule that forces ALL traffic through the VPN connection.:
      persist-key;
      persist-tun;
      remote-cert-tls server;
      reneg-sec 0;
      route-nopull;

Navigate to Status -> OpenVPN. Check if status up.

## Create Interface

Create a new interface, Interface -> Assign, and select the OpenVPN connection, enable.

Create Alias OpenVPNHosts for IP's to send through OpenVPN.

Check System: Advanced: Miscellaneous, "Skip rules when gateway is down":
By default, when a rule has a specific gateway set, and this gateway is down, rule is created and traffic is sent to default gateway.This option overrides that behavior and the rule is not created when gateway is down.

## Mappings

1.  Navigate to Firewall -> NAT -> Outbound.
1.  Set the Mode under General Logging Options to "Manual Outbound NAT rule generation (AON)", and click Save.
1.  Under the Mappings section, click the duplicate (dual-page) icon on the right for the first rule shown in the list.
1.  Set Interface to "OpenVPN" and click Save at the bottom.
1.  For interfaces to use the VPN, repeat the last two steps for all remaining rule shown under Mappings, until every rule has a duplicate for OpenVPN.

## Rules

Add a firewall rule for interface(s) being sent through VPN.

Protocol: Any
Source: Single Host, OpenVPNHosts
Advanced: Set Gateway to VPN.

Add rule to block if VPN down

Protocol: Any
Source: Single Host, OpenVPNHosts
Advanced: Set Gateway to VPN.

## Check IP
Check IP on CLI with:

{%ace edit=true, lang='sh'%}
curl -s checkip.dyndns.org
{%endace%}


## References

*   [Tunneling Specific Traffic over a VPN with pfSense - Muffin's Lab](https://blog.monstermuffin.org/tunneling-specific-traffic-over-a-vpn-with-pfsense/)
*  [Routing SOME traffic / static IPs through OpenVPN (over PIA) - pfsense forum](https://forum.pfsense.org/index.php?topic=72902.0)
