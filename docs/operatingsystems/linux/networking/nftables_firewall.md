---
title: nftables Firewall
category: [ archlinux, linux ]
keywords: archlinux, linux, firewall, nftables
tags: [ archlinux, linux, firewall, nftables ]
---

# nftables Firewall

Creating a simple firewall with nftables that blocks all common traffic except SSH.

```
table inet filter {
	chain input {
		type filter hook input priority 0; policy drop;

    # allow established/related connections
		ct state {established,related} accept

    # allow from loopback
		iif "lo" accept

    # drop invalid connections
		ct state invalid drop

    # New echo requests (pings) will be accepted:
		icmp type echo-request ct state new accept

    # New udp traffic will jump to the UDP chain
		ip protocol udp ct state new jump UDP

    # New tcp traffic will jump to the TCP chain
		tcp flags & (fin | syn | rst | ack) == syn ct state new jump TCP

    # Reject all traffic that was not processed by other rules
		ip protocol udp reject
		ip protocol tcp reject with tcp reset
		meta nfproto ipv4 counter packets 0 bytes 0 reject with icmp type prot-unreachable
	}

	chain forward {
		type filter hook forward priority 0; policy drop;
	}

	chain output {
		type filter hook output priority 0; policy accept;
	}

	chain TCP {
    # Accept SSH traffic on port 22
		tcp dport ssh accept
	}

	chain UDP {
	}
}
```
