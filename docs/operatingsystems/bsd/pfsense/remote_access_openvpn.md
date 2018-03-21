---
title: Remote Access OpenVPN
category: [ bsd, pfsense ]
keywords: freebsd, bsd, pfsense, vpn, openvpn
tags: [ freebsd, bsd, pfsense, networking, vpn, openvpn ]
---

# Remote Access OpenVPN

Set up an OpenVPN server on pfSense for remote access under **VPN > OpenVPN**..

## Certificate Authority

Start the **Wizard**.

Use **Local User Access** for a basic setup.

*   **Descriptive Name** - RamsdenOpenVPNCA
*   **Key Length** - Default
*   **Lifetime** - Default
*   **Country Code, State/Province, City, Organization** - Local area.
*   **E-mail** - Just used for reference.

## Certificate

Same as Certificate Authority.

## OpenVPN Server Configuration

*   **TLS Authentication** - Highly recommended.
*   **Tunnel Network** New, unique network not in the current network or routing table. eg. ```10.0.8.0/24```
*   **Local Network** - The network(s) here on the server that the clients will need to reach, for example 192.168.1.0/24

## Firewall Rules

The next screen offers the choice to add firewall rules automatically. For convenience, check both unless the rules will be managed manually.

## References

*   pfSense docs - [OpenVPN Remote Access Server](https://doc.pfsense.org/index.php/OpenVPN_Remote_Access_Server)
